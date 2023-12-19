import React from 'react'
import classes from "./Running.module.css"

type Props = {}

const WorkflowStatusRunning = (props: Props) => {
  return (
    <div style={{
      backgroundColor: "#dbeafe",
      padding: "5px 10px",
      borderRadius: "5px",
      width: "fit-content",
      color: "#1d4ed8",
      opacity: 0.8,
      display: "flex",
      fontWeight: 600,
    }}><div style={{
      zIndex: 50,
    }}>Running</div>
      <div className={classes.heartRate}>
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="30px" height="18px" viewBox="0 0 150 73" enable-background="new 0 0 150 73" xmlSpace="preserve">
          <polyline fill="none" stroke="#1d4ed8" stroke-width="3" stroke-miterlimit="10" points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"
          />
        </svg>
        <div className={classes.fadeIn}></div>
        <div className={classes.fadeOut}></div>
      </div></div>
  )
}

export default WorkflowStatusRunning