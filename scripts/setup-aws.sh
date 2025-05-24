#!/bin/bash

# AWS S3 Setup Script for Music Platform
# This script helps set up AWS S3 bucket and IAM policies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME=${1:-"music-platform-$(date +%s)"}
REGION=${2:-"us-east-1"}
IAM_USER_NAME="music-platform-s3-user"
POLICY_NAME="MusicPlatformS3Policy"

echo -e "${GREEN}Setting up AWS S3 for Music Platform${NC}"
echo "Bucket Name: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Please configure AWS CLI with 'aws configure'${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating S3 bucket...${NC}"

# Create S3 bucket
if aws s3 mb s3://$BUCKET_NAME --region $REGION; then
    echo -e "${GREEN}✓ S3 bucket created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create S3 bucket${NC}"
    exit 1
fi

# Enable versioning
echo -e "${YELLOW}Enabling versioning...${NC}"
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

# Set up bucket policy for secure access
echo -e "${YELLOW}Setting up bucket policy...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyInsecureConnections",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Enable server-side encryption
echo -e "${YELLOW}Enabling server-side encryption...${NC}"
aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

# Block public access
echo -e "${YELLOW}Blocking public access...${NC}"
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Create IAM user for application
echo -e "${YELLOW}Creating IAM user...${NC}"
if aws iam create-user --user-name $IAM_USER_NAME; then
    echo -e "${GREEN}✓ IAM user created successfully${NC}"
else
    echo -e "${YELLOW}IAM user might already exist${NC}"
fi

# Create IAM policy
echo -e "${YELLOW}Creating IAM policy...${NC}"
cat > s3-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion",
                "s3:DeleteObjectVersion"
            ],
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetBucketVersioning"
            ],
            "Resource": "arn:aws:s3:::$BUCKET_NAME"
        }
    ]
}
EOF

aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://s3-policy.json \
    --description "Policy for Music Platform S3 access"

rm s3-policy.json

# Attach policy to user
echo -e "${YELLOW}Attaching policy to user...${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws iam attach-user-policy \
    --user-name $IAM_USER_NAME \
    --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"

# Create access keys
echo -e "${YELLOW}Creating access keys...${NC}"
ACCESS_KEYS=$(aws iam create-access-key --user-name $IAM_USER_NAME --output json)
ACCESS_KEY_ID=$(echo $ACCESS_KEYS | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEYS | jq -r '.AccessKey.SecretAccessKey')

# Create CORS configuration
echo -e "${YELLOW}Setting up CORS configuration...${NC}"
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json
rm cors-config.json

echo ""
echo -e "${GREEN}✓ AWS S3 setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Add these environment variables to your .env file:${NC}"
echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
echo "AWS_REGION=$REGION"
echo "AWS_S3_BUCKET_NAME=$BUCKET_NAME"
echo ""
echo -e "${YELLOW}Security Notes:${NC}"
echo "- Store these credentials securely"
echo "- Never commit them to version control"
echo "- Consider using AWS IAM roles in production"
echo "- Enable CloudTrail for audit logging"
echo ""
echo -e "${GREEN}Setup complete! Your S3 bucket is ready for use.${NC}"
