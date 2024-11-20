import {
  HoverInfoLabel,
  SectionBox,
  ShowHideLabel,
} from "@kinvolk/headlamp-plugin/lib/components/common";
import { localeDate, timeAgo } from "@kinvolk/headlamp-plugin/lib/Utils";
import Table from "./Table";

export function ObjectEvents(props: { events: any }) {
  const { events } = props;
  if (!events) {
    return null;
  }
  return (
    <SectionBox title={"Events"}>
      <Table
        defaultSortingColumn={4}
        columns={[
          {
            header: "Type",
            accessorFn: (item) => {
              return item.type;
            },
          },
          {
            header: "Reason",
            accessorFn: (item) => {
              return item.reason;
            },
          },
          {
            header: "From",
            accessorFn: (item) => {
              return item.source.component;
            },
          },
          {
            header: "Message",
            accessorFn: (item) => {
              return (
                item && (
                  <ShowHideLabel labelId={`${item?.metadata?.uid}-message`}>
                    {item.message ?? ""}
                  </ShowHideLabel>
                )
              );
            },
          },
          {
            id: "age",
            header: "Age",
            accessorFn: (item) => {
              if (item.count > 1) {
                return `${timeAgo(item.lastOccurrence)} (${
                  item.count
                } times over ${timeAgo(item.firstOccurrence)})`;
              }
              const eventDate = timeAgo(item.lastOccurrence, {
                format: "mini",
              });
              let label: string;
              if (item.count > 1) {
                label = `${eventDate} ${item.count} times since ${timeAgo(
                  item.firstOccurrence
                )}`;
              } else {
                label = eventDate;
              }

              return (
                <HoverInfoLabel
                  label={label}
                  hoverInfo={localeDate(item.lastOccurrence)}
                  icon="mdi:calendar"
                />
              );
            },
            gridTemplate: "min-content",
            enableColumnFilter: false,
            muiTableBodyCellProps: {
              align: "right",
            },
            sortingFn: (rowA, rowB) => {
              return (
                new Date(rowB.lastTimestamp).getTime() -
                new Date(rowA.lastTimestamp).getTime()
              );
            },
          },
        ]}
        data={events}
        initialState={{
          sorting: [
            {
              id: "Age",
              desc: false,
            },
          ],
        }}
      />
    </SectionBox>
  );
}
