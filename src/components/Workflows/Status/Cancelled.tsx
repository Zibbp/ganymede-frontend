import React from 'react'

type Props = {}

const WorkflowStatusCancelled = (props: Props) => {
  return (
    <div style={{
      backgroundColor: "#fef9c3",
      padding: "5px 10px",
      borderRadius: "5px",
      width: "fit-content",
      color: "#9f7b4b",
      opacity: 0.8,
      fontWeight: 600,
    }}>Cancelled</div>
  )
}

export default WorkflowStatusCancelled