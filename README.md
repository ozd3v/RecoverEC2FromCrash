
<h3 align="center">Auto Recover EC2 from crash </h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/ozd3v/RecoverEC2FromCrash.svg)](https://github.com/ozd3v/RecoverEC2FromCrash/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/ozd3v/RecoverEC2FromCrash.svg)](https://github.com/ozd3v/RecoverEC2FromCrash/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Few lines describing your project.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

Auto recover an EC2 instance from a crash, without using Load Balancer or Target Group. 
The EC2 will be sending a metric to cloudwath trough and active running service on the system (like systemd service)
if the metric is loss (missing data) it will generate an SNS notification that will trigger a lambda function.

The lambda function will spawn a new EC2 instances bases on an AMI

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them.

IAM ROLE for EC2 to send metric data to cloudwatch. The new role wil have the name "CloudWatchAgentServerRoleEC2" if you change it, remeber to change it on the lamba policy below. 
```
Create new ROL  with CloudWatchAgentServerPolicy  and AutoScalingFullAccess
Name it : CloudWatchAgentServerRoleEC2
```

IAM policy needed for lambda to use:
```

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "arn:aws:iam::582774872867:role/CloudWatchAgentServerRoleEC2"
        },
        {
            "Effect": "Allow",
            "Action": "iam:ListInstanceProfiles",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:Start*",
                "ec2:Stop*",
                "ec2:Describe*",
                "ec2:RunInstances",
                "ec2:DeleteTags",
                "ec2:CreateTags",
                "ec2:AssociateIamInstanceProfile",
                "ec2:ReplaceIamInstanceProfileAssociation"
            ],
            "Resource": "*"
        }
    ]
}

```
Create a ROLE useing the above policy

also have AWS CLI installed and an adecuate programatic user 


## 🔧  Installing Service SystemD

Fisrt, login to the EC2 instance an create a health check services, here we wil user CentOS systemd

using nano or anothe editor create the script that will send the metric to cloudwatch :
```
sudo nano /usr/bin/healthcheck.py

```

paste and modify the code from healthcheck.py and create a new service under systemd

```
sudo nano /etc/systemd/system/awshealthcheck.service
```
paste and modify the code (if required) from awshealthcheck.service and run this commnands:

```
sudo systemctl enable awshealthcheck.service
sudo systemctl start awshealthcheck.service
sudo systemctl status awshealthcheck.service

```
if you see the process running is all good. 


End with an example of getting some data out of the system or using it for a little demo.

### 🔧 Check the metric <a name = "tests"></a>

Check cloudwatch to see if the metrics is reaching it

### Installing Lambda function

create a new lambda function the your region, for nodeJS and copy paste de code and replace the capital variables

```
var AWS = require('aws-sdk');

AWS.config.update({region: 'REGION'});

exports.handler = async (event) => {
    var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
    var instanceParams = {
       ImageId: 'AMI ID', 
       InstanceType: 'SIZE OF THE INSTANCE',
       KeyName: 'KEY PAIR NAME',
       MinCount: 1,
       MaxCount: 1,
         IamInstanceProfile: {
    Name: 'CloudWatchAgentServerRoleEC2'
  },
       SubnetId: 'SUBNET ID',
       SecurityGroupIds: ['SECURITY GRP ID'],
       
         TagSpecifications: [
     {
    ResourceType: "instance", 
    Tags: [
       {
      Key: "Name", 
      Value: "NAME FOR THE NEW INSTANCE"
     }
    ]
   }
  ]
    };
    
    var promise = ec2.runInstances(instanceParams).promise();
    
    const result = await promise.then(function (data){
        console.log(data);
        const instanceId = data.Instances[0].InstanceId;
        return instanceId;
    },
    function (error){
        console.log(error);
        const instanceId = undefined
        return instanceId;
        
    });


    const response = {
        statusCode: 200,
        body: result,
    };
    return response;
};

```
### Create SNS topic and subcriptions

from cloudWatch, choose the new metric and create an alarm, from this alarm create a NEW SNS topic.
After the SNS is created, go to SNS console and create a new suscription. Choose lamba, and select the 
lambda function created above. 


## 🎈 Usage <a name="usage"></a>

Go and shutdown the EC2 instance, this will triger an alarm that will trigger the SNS topic, that will trigger the lambda function who will spawn a new EC2

## 🚀 Deployment <a name = "deployment"></a>

None for de moment.

## ⛏️ Built Using <a name = "built_using"></a>

- [CentOS](https://www.centos.org/) - O.S
- [Pyton](https://www.python.org/) - Programming Language
- [NodeJs](https://nodejs.org/en/) - Server Environment

## ✍️ Authors <a name = "authors"></a>

- [@ozd3ev](https://github.com/ozd3ev) - Idea & Initial work
- [@8SQ](https://www.8sq.cl) - Entrepreneurship
- [@linkedin](https://www.linkedin.com/in/ricardoberrezueta/) - Me


## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Hat tip to anyone whose code was used
- Inspiration
- References
