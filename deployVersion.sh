#!/bin/bash
#Instructions:
#   From the same directory as this file, run: ./deployVersion.sh
#   The URL of the deployed version is detailed in the output from running the script

branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
branch_lowercase=${branch,,}
branch_url_compliant=${branch_lowercase/_/-}

set -x

if [ $branch == "master" ]
then
    mvn package appengine:deploy -Dapp.deploy.version=1 -Dapp.deploy.promote=True
else
    mvn package appengine:deploy -Dapp.deploy.version="${branch_url_compliant}" -Dapp.deploy.promote=False
fi