import { Center, Title } from "@mantine/core"

export const ChannelHeader = ({channel}: any) => {

  return (
    <div style={{width: '100%', height: 75, marginBottom: 5}} >
     <Center style={{ width: '100%', height: 75 }}>
      <Title order={1}>{channel.display_name}</Title>
    </Center>
    </div>
  )
}