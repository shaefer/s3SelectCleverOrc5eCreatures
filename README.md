# S3Select Hello World Example

https://www.serverless.com/blog/cicd-for-serverless-part-1/
https://www.serverless.com/blog/cicd-for-serverless-part-2/

Getting started with Lambda isn't hard at all. But if you are shooting for a super simple API you are still left with a lot of boilerplate things and missing pieces to make it really useful. Each which have their own small gotchas. Testing, deployments, API Gateway, cors, staged deployments, database setup, roles, permissions, javascript modules, dependency install, etc. It can still be a decent amount of work to get to something straightforward: A datasource accessible through lambda driven by a restful API written with Javascript with no hoops for pulling in additional js dependencies. Serverless helps you get there without worrying about all that boilerplate.

## Do this first (prerequisites): 
- [Follow Serverless setup guide](https://www.serverless.com/framework/docs/providers/aws/guide/installation/) for 3 things:
    1. Install Node
    1. Install Serverless
    1. Setup AWS - mostly [setting up credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

If you are looking for a first-time guide to serverless and lambda's please check out [this serverless example project](https://github.com/shaefer/serverless_example) first.

## Getting Started
1. Fork the project. 
1. `npm install`
1. Look through the project:
    - **Understand the document we are querying against and the query we are using**
        - Look at `serverless.yml` for the definitions of things going into AWS. 
        - Make sure to check `service`, `region`, and `stage` on the provider entry in `serverless.yml` to your desired otherwise you'll deploy to `us-west-2` and the stage will be named `dev` The first time you create all this in AWS you probably should go look through everything (api gateways, lambdas) that got created. It is all happening with CloudFormation and it is doing a lot of nice things for you and all the names and such are coming from the serverless.yml file and are under your control.
1. The key thing to setup is the s3 bucket that will house your data. Change the bucket(parent folder) and key(subfolder/name) in s3Select.js to the resource you want to reference. Note: the region is irrelevant for s3 as s3 recources are global (not region specific).
1. Upload the sample data file in allCreatures.json which is just a set of JSON records - 1 record per line. Example code makes some assumptions about the fields and shapes of these records. You can alter the query under Expression in the s3Select.js file to test out different ways to select data from your json records. The initial one shows the way it can handle numeric formats and comparisons.
1. Run it locally `serverless invoke local --function s3SelectQuery` This is like hitting your lambda live with the earlier mentioned URI. 
1. Run `serverless deploy` to create the lambda and dynamodb table in AWS. The output for the deploy will show success and give you the url for the deployed API gateway endpoint that you can hit to test it live.
1. *OPTIONAL BUT IMPORTANT*: If you forgot something and want to rollback...**BEFORE** you change anything in the serverless.yml just run a `serverless remove` and it will delete all the resources it just created...or try to. Since serverless created everything with Cloudformation it can remove it too. Find more details in the [serverless docs](https://www.serverless.com/framework/docs/providers/aws/cli-reference/remove/).

https://docs.aws.amazon.com/AmazonS3/latest/API/API_SelectObjectContent.html
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html

## Common problems and other things to understand
* Just like a real database things won't work great if the data within the columns isn't all the same datatype...you can do a bunch of odd SQL to work around this data, but it usually makes more sense to clean up your data to have a single data type.
* The format of the json file is actually jsonl format...which is a one object per line with no comma separators. (Also no wrapping json array). There are probably other supported formats, but the jsonl is just the one I was able to use easily across multiple AWS services I was playing with. s3select does great with this format as well. https://tableconvert.com/json-to-jsonlines

## S3Select Notes
* There is no `NOT IN` so you have to join your clauses with `something != 'this' AND something != 'that'`
* Escape single ticks in S3Select with an additional single tick `Daniel's Example` would be escaped like `Daniel''s Example` Don't get confused when you are escaping your base code vs. what the final string needs to look like in the expression.