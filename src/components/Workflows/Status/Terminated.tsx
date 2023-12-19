import React from 'react'

type Props = {}

const WorkflowStatusTerminated = (props: Props) => {
  return (
    <div style={{
      backgroundColor: "#fba0a1",
      padding: "5px 10px",
      borderRadius: "5px",
      width: "fit-content",
      color: "#a90003",
      opacity: 0.8,
      fontWeight: 600,
    }}>Terminated</div>
  )
}

export default WorkflowStatusTerminated