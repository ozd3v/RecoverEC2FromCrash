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