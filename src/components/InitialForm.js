import React, { useEffect, useState} from 'react';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

import 'bootstrap/dist/css/bootstrap.css';
import { Amplify, Auth, API, Storage } from "aws-amplify";
import aws_exports from './../aws-exports';

Amplify.configure(aws_exports);
API.configure(aws_exports);

function InitialForm() {
  const api = "apiMainLambda"

  const [blockingValue, setBlockingValue] = useState(false);

  const [courseValue, setCourseValue] = useState('')
  const [tiValue, setTiValue] = useState('')
  const [tableValue, setTableValue] = useState('')
  const [questNumValue, setQuestNumValue] = useState('')
  const [collectedPicsValue, setCollectedPicsValue] = useState('')
  const [picNameValue, setPicNameValue] = useState('')

  const [errorValue, setErrorValue] = useState('')

  /// Collects Questions and Puts them to DynamoDB
  const fetchQuestions = () => {
    const path = "/collect-questions";
    const initParams = {
        body: {
          courseid: courseValue,
          t: tiValue,
          table: tableValue
        }
    };

    API.post(api, path, initParams)
     .then(response => {
        console.log("Worked");
        console.log(response);
        let r = JSON.parse(response);
        setQuestNumValue(r.InsertedItems);
     })
     .catch(error => {
       console.log(error);
       setErrorValue(error);
     })
  }

  /// Collects Names of Pictures
  const scanForPictures = () => {
    const path = "/scan-for-pics";
    const initParams = {
        queryStringParameters: {
          table: tableValue
        }
    };
    console.log(initParams)
    alert('This Works!')

    API.get(api, path, initParams)
     .then(response => {
        console.log("Collected");
        console.log(response);
        setCollectedPicsValue(response);
     })
     .catch(error => {
       console.log(error);
       setErrorValue(error);
     })
  }

  /// Called from HTML
  const savePictures = () => {
      collectedPicsValue.question.map(pic => savePicsToS3("question/", pic))
      collectedPicsValue.answer.map(pic => savePicsToS3("answer/", pic))
  }

  /// Saves Pics to S3
  const savePicsToS3 = (fld, picName) => {
    setBlockingValue(true);
    setPicNameValue("Saving "+picName+" to S3");
    const path = "/save-pictures";
    const initParams = {
        body: {
          courseid: courseValue,
          picture: picName,
          folder: fld,
          bucket: aws_exports.aws_user_files_s3_bucket
        }
    };

    API.post(api, path, initParams)
     .then(response => {
        setBlockingValue(false)
        console.log("Worked");
        let r = JSON.parse(response);
        console.log(r.result);
     })
     .catch(error => {
       setBlockingValue(false);
       console.log(error);
       setErrorValue(error);
     })
  }

  return(
    <div className="container w-5">
        <BlockUi tag="div" blocking={blockingValue} message={picNameValue}>
        <h1>Collect Questions</h1>
        <div className="row">
            <div className="col-sm-6">
                <label htmlFor="courseid">Course ID</label>
            </div>
            <div className="col-sm-6">
                <input id="courseid" onChange={(e) => setCourseValue(e.target.value)} />
            </div>
        </div>
        <div className="row">
            <div className="col-sm-6">
                <label htmlFor="tvalue">T Value</label>
            </div>
            <div className="col-sm-6">
                <input id="tvalue" onChange={(e) => setTiValue(e.target.value)}/>
            </div>
        </div>
        <div className="row">
            <div className="col-sm-6">
                <label htmlFor="tablename">Table Name</label>
            </div>
            <div className="col-sm-6">
                <input id="tablename" onChange={(e) => setTableValue(e.target.value)}/>
            </div>
        </div>
        <button className="btn btn-info" onClick={fetchQuestions}
          disabled={!courseValue || !tiValue || !tableValue } >
            Press IT
        </button>

        <div className="row">
            <div className="col-sm-6">
            Number of Question: {questNumValue}
            <button className="btn btn-info" onClick={scanForPictures}> Find Pics </button>
          </div>
          <div className="col-sm-6">
              <button className="btn btn-info">Back Up Questions to S3</button>
          </div>
        </div>


        {collectedPicsValue &&
          <div>
            <div className="row">
                <div className="col-sm-6">
                    <p>Question Pictures:</p>
                    {collectedPicsValue.question.map(que => <div>{que}</div>)}
                </div>
                <div className="col-sm-6">
                    <p>Answer Pictures:</p>
                    {collectedPicsValue.answer.map(que => <div>{que}</div>)}
                </div>
            </div>
            <button className="btn btn-info" onClick={savePictures}>Download Pictures to S3</button>
          </div>
        }

      </BlockUi>
    </div>
  )
}

export default InitialForm;
