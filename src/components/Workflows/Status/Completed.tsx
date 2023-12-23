import React from 'react'

type Props = {}

const WorkflowStatusCompleted = (props: Props) => {
  return (
    <div style={{
      backgroundColor: "#dcfce7",
      padding: "5px 10px",
      borderRadius: "5px",
      width: "fit-content",
      color: "#2b8a3e",
      opacity: 0.8,
      fontWeight: 600,
    }}>Completed</div>
  )
}

export default WorkflowStatusCompleted