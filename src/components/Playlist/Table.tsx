import { Modal, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import GanymedeLoader from "../Utils/GanymedeLoader";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import EditPlaylistModal from "./EditPlaylistModal";

const PlaylistTable = () => {
  const router = useRouter();

  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [editPlaylistDescription, setEditPlaylistDescription] = useState("");

  const { isLoading, error, data } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: "/api/v1/playlist",
        },
        false
      ).then((res) => res?.data),
  });

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        highlightOnHover
        // provide data
        records={data}
        // define columns
        columns={[
          {
            accessor: "name",
            // this column has a custom title
            title: "Name",
            // right-align column
            // textAlignment: "right",
            render: ({ name, id }) => (
              <Link href={`/playlists/${id}`}>{name}</Link>
            ),
          },
          {
            accessor: "description",
            title: "Description",
            render: ({ description }) => (
              <Text lineClamp={1}>{description}</Text>
            ),
          },
        ]}
        onRowClick={({ record: { id } }) =>
          router.push({
            pathname: `/playlists/${id}`,
          })
        }
      />
    </div>
  );
};

export default PlaylistTable;
