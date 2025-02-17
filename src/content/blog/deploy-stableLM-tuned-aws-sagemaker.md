---
title: "Deploy StableLM models on AWS Sagemaker Endpoints"
author: "Sajal Sharma" # Replace with the actual author's name
pubDatetime: 2023-04-30T00:00:00Z
slug: deploy-stablelm-models-aws-sagemaker
featured: false
draft: false
tags:
  - llms
  - nlp
  - aws
  - generative-ai
description: "This blog post guides you through the process of deploying StableLM models on AWS Sagemaker Endpoints, including creating a custom inference script and setting up the endpoint."
canonicalURL: "" # Add if the article is published elsewhere
---

## Table of contents

## Introduction

Welcome to this blog post explaining how to deploy StableLM models on AWS Sagemaker Endpoints. As of 30 April 2023, the process of deploying the model on Sagemaker Endpoints is not
as straightforward as some of the other models on HuggingFace, due to the need to package custom inference code with the model. This blog post will explain how to do this step by step.

We'll be deploying the StableLM-Tuned-Alpha 7b variant on the model on an ml.g5.4xlarge instance. StableLM-Tuned-Alpha is a suite of 3B and 7B parameter decoder-only language models built on top of the StableLM-Base-Alpha models and further fine-tuned on various chat and instruction-following datasets.

This blog post is based on the [Deploy FLAN-UL2 20B on Amazon SageMaker](https://www.philschmid.de/deploy-flan-ul2-sagemaker) blog post by [Philipp Schmid](https://www.philschmid.de/), so please
check out his website for excellent content about NLP and AWS.

![StableLM](@assets/images/blog/deploying-stablelm/newparrot.png)

<Caption text="StableLM" />

## Steps:

1. Download the model from Huggingface.
2. Create a custom inference script.
3. Package the model and inference script by creating the model.tar.gz archive.
4. Upload the model to S3.
5. Create a Sagemaker Endpoint.

You can follow the steps on your local machine or on an AWS Sagemaker Studio notebook / terminal. You'll need to make sure that your local machine or the Sagemaker instance has enough
disk space to download the model & create the archive file. This blog post will also not go into details about how to set up your AWS account permissions, so please make sure to
follow the blog post provided in the references on how to do this for a similar model.

### 1. Download the model from Huggingface.

Make sure you have _git_ and _git-lfs_ installed on your system. Simply run the following commands in your terminal to download the model:

```bash
# Make sure you have git-lfs installed (https://git-lfs.com)
git lfs install
git clone https://huggingface.co/stabilityai/stablelm-tuned-alpha-7b
```

The model will then be available inside the directory _stablelm-tuned-alpha-7b_.

### 2. Create a custom inference script.

Change the directory to the model directory and create a directory called _code_.

```bash
cd stablelm-tuned-alpha-7b
mkdir code
```

Create a file called _inference_.py inside the _code_ directory and copy the following code into it:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteria, StoppingCriteriaList
import torch

SYSTEM_PROMPT = """<|SYSTEM|># StableLM Tuned (Alpha version)
- StableLM is a helpful and harmless open-source AI language model developed by StabilityAI.
- StableLM is excited to be able to help the user, but will refuse to do anything that could be considered harmful to the user.
- StableLM is more than just an information source, StableLM is also able to write poetry, short stories, and make jokes.
- StableLM will refuse to participate in anything that could harm a human.
"""

class StopOnTokens(StoppingCriteria):
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        stop_ids = [50278, 50279, 50277, 1, 0]
        for stop_id in stop_ids:
            if input_ids[0][-1] == stop_id:
                return True
        return False

def model_fn(model_dir):
    # Load model from S3
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForCausalLM.from_pretrained(model_dir)
    model.half().cuda()
    return model, tokenizer

def predict_fn(data, model_and_tokenizer):

    model, tokenizer = model_and_tokenizer

    input = data.pop("input", None)

    prompt = f"{SYSTEM_PROMPT}<|USER|>{input}<|ASSISTANT|>"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    input_ids = inputs['input_ids']
    tokens = model.generate(
      **inputs,
      max_new_tokens=128,
      temperature=0.5,
      do_sample=True,
      stopping_criteria=StoppingCriteriaList([StopOnTokens()])
    )
    # the code has been changed to only return the generated text, and not the original text
    # simply remove the slicing below to return the input text in addition to
    # the generated text
    output = tokenizer.decode(tokens[:, input_ids.shape[1]:][0], skip_special_tokens=True)
    return output
```

This script now includes the custom code needed for reading the model correctly and making predictions. I've included some slicing on the tokens to only return the generated text, and not the original text. You can remove this if you want to return the original text as well.

You can change the SYSTEM_PROMPT to whatever you like, but keep in mind that including the system prompt inside the inference code will bundle it with your model.
If you want to try out the model with a different system prompt, you can pass it as an input when invoking the endpoint instead of having it hardcoded inside the inference code.

### 3. Package the model and inference script by creating the model.tar.gz archive.

Now that we have the model and the inference code, we need to package it into a single archive file. We'll be using the _tar_ command to do this. Make sure you have _tar_ installed on your system.

Assuming you are inside the _stablelm-tuned-alpha-7b_ directory, run the following command to create the archive file:

```bash
tar zcvf model.tar.gz *
```

The command includes all the files within the above directory in the _model.tar.gz_. It takes around 30mins to run on my M1 Mac.

### 4. Upload the model to S3.

After creating a machine learning model, the next step is to make it accessible for deployment. One way to do this is to upload the model to an S3 bucket. This process involves compressing the model into a .tar.gz file and then uploading it to an S3 bucket.

To accomplish this, you can refer to the [official AWS guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) on how to upload objects to S3. This guide provides step-by-step instructions on how to create an S3 bucket, configure the appropriate permissions, and upload files to the bucket. While we won't go into the specifics of this process, following the AWS guide will ensure that your model is properly uploaded and ready for deployment.

### 5. Create a Sagemaker Endpoint.

Now that we have the model uploaded to S3, we can create a Sagemaker Endpoint using the Sagemaker python SDK. It includes a class called _HuggingFaceModel_ that we can use to create the endpoint.

Make sure to install the Sagemaker SDK first in your Python environment:

```bash
pip install sagemaker
```

Make sure that you have your S3 object URL ready. It starts with `s3://`. Please make sure that you have your AWS credentials set up in your environment as well. You can follow the [official AWS guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) on how to do this.

Now, you can run the following Python code to create the endpoint.

```python
import sagemaker
from sagemaker.huggingface.model import HuggingFaceModel

MODEL_S3_LOCATION = "" # fill in with your S3 object URL for the model

huggingface_model = HuggingFaceModel(
    model_data=MODEL_S3_LOCATION,
    role= sagemaker.get_execution_role(), # IAM role with permissions to create an Endpoint
    transformers_version="4.26",
    pytorch_version="1.13",
    py_version="py39"
)

predictor = huggingface_model.deploy(initial_instance_count=1, instance_type="ml.g5.4xlarge")
```

The code above creates a HuggingFaceModel object and deploys it to a Sagemaker Endpoint. It uses the _ml.g5.4xlarge_ instance type, but you can experiment with other instance types if you are using a smaller model (like the 3b variant).

You can invoke the endpoint using the following code:

```python
predictor.predict({ "input": "Write me a poem about AWS."})
```

It should hopefully work if you followed the above steps. If you run into any issues, please feel free to reach out to me on contact@sajalsharma.com and I'll update the post accordingly.

## References

1. [Deploy FLAN-UL2 20B on Amazon SageMaker](https://www.philschmid.de/deploy-flan-ul2-sagemaker)
2. [StabileLM Tuned Alpha 7b on HuggingFace](https://huggingface.co/stabilityai/stablelm-tuned-alpha-7b)
3. [Uploading objects to an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)
