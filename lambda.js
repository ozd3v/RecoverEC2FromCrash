var AWS = require('aws-sdk');

AWS.config.update({region: 'us-west-2'});

exports.handler = async (event) => {
    var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
    var instanceParams = {
       ImageId: 'ami-09016603f45eb4d67', 
       InstanceType: 't2.micro',
       KeyName: 'test-oregon',
       MinCount: 1,
       MaxCount: 1,
         IamInstanceProfile: {
    Name: 'CloudWatchAgentServerRoleEC2'
  },
       SubnetId: 'subnet-02e754a5b393feb1a',
       SecurityGroupIds: ['sg-0e32c3bb6b8174096'],
       
         TagSpecifications: [
     {
    ResourceType: "instance", 
    Tags: [
       {
      Key: "Name", 
      Value: "test-org"
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
