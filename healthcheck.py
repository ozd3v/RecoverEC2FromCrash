#!/usr/local/bin/python3.9

import boto3
from datetime import datetime
import subprocess
from time import time, sleep


NAMESPACE="YOUR_NAME_SPACE"
METRICNAME="healthCheck"
DIMENSIONNAME="YOUR_DIMENSION_NAME"
IDKEY="YOUR_ID_KEY"
ACCESSKEY="YOUR_SECRET_ACCESS_KEY"
REGION="YOUR_REGION"
URLMETADATA="http://169.254.169.254/latest/meta-data/"
URLMETAID="http://169.254.169.254/latest/meta-data/instance-id"

def call_aws_metric (NAMESPACE, METRICNAME, DIMENSIONNAME, DIMENSIONVALUE, IDKEY, ACCESSKEY, REGION, VALUE_VAR, UNIT_VAR, STORAGE_RES):
    session = boto3.Session(
        aws_access_key_id=IDKEY,
        aws_secret_access_key=ACCESSKEY,
        region_name=REGION
    )
    cw = session.resource('cloudwatch')

    response = cw.meta.client.put_metric_data(
        Namespace=NAMESPACE,
        MetricData=[
            {
                'MetricName': METRICNAME,
                'Dimensions': [
                    {
                        'Name': DIMENSIONNAME,
                        'Value': DIMENSIONVALUE
                    },
                ],
                'Timestamp': datetime.now(),
                'Value': VALUE_VAR,
                'Unit': UNIT_VAR,
                'StorageResolution': STORAGE_RES
            },
        ]
    )
    return (response)

def call_cmd(cmd):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, universal_newlines=True, shell=True)
    (output, err) = p.communicate()
    # This makes the wait possible
    p_status = p.wait()

    return output

metrica = 1

cmd = "curl -s http://169.254.169.254/latest/meta-data/instance-id"
instanceId = call_cmd(cmd)
#print(instanceId)
cmd = 'aws ec2 describe-tags --region '+REGION+' --filters "Name=resource-id,Values='+instanceId+'" "Name=key,Values=Name" --output text | cut -f5'
name = call_cmd(cmd)
name =name.split()[0]
DIMENSIONVALUE = name

while True:
    sleep(60 - time() % 60)
    call_aws_metric (NAMESPACE, METRICNAME, DIMENSIONNAME, DIMENSIONVALUE, IDKEY, ACCESSKEY, REGION, metrica, 'Count', 1)