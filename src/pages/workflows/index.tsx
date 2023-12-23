import React from 'react'
import WorkflowsActiveTable from '../../components/Workflows/ActiveTable'
import { Container, Tabs } from '@mantine/core'
import WorkflowsClosedTable from '../../components/Workflows/ClosedTable'

type Props = {}

const WorkflowsPage = (props: Props) => {
  return (
    <div>
      <Container size="7xl">
        <Tabs defaultValue="active">
          <Tabs.List>
            <Tabs.Tab value="active" >
              Active
            </Tabs.Tab>
            <Tabs.Tab value="closed" >
              Closed
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="active">
            <WorkflowsActiveTable />
          </Tabs.Panel>

          <Tabs.Panel value="closed">
            <WorkflowsClosedTable />
          </Tabs.Panel>

        </Tabs>

      </Container>
    </div>
  )
}

export default WorkflowsPage