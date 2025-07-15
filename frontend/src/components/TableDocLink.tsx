import { IconButton, Modal, Fade, Drawer } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { document } from "../types/user";
import DocDeleteModal from "./DocDeleteModal";
import { useState } from "react";
import DrawerContent from "./DrawerContent";

export default function TableDocLink(props: {
  item: document;
  setDocuments: any;
  setFilteredDocuments: any;
  showAlert: any;
  id: number | undefined;
  url: string;
}) {
  const {
    item,
    setDocuments,
    setFilteredDocuments,
    id,
    url,
    showAlert,
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  return (
    <div className=" flex justify-between items-center truncate">
      <a
        className="underline hover:text-sky-500 transition-all ease-linear duration-200 max-w-[150px] overflow-hidden truncate"
        // To check if it's a storage or an online link
        href={
          item?.document_url !== null
            ? item.document_url.startsWith("/uploads/")
              ? `http://localhost:8002${item.document_url}`
              : item.document_url
            : "*"
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {item?.document_url}
      </a>

      {/* Buttons */}
      <div className="flex">
        <IconButton
          sx={{ color: "#2e439d" }}
          size="small"
          onClick={() => setDrawerOpen(true)}
          style={{ padding: "4px" }}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          color="error"
          onClick={() => {
            setModalOpen(true);
          }}
          style={{ padding: "4px" }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </div>
      {/* Delete Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Fade in={modalOpen}>
          <div>
            <DocDeleteModal
              //👇 props
              setModalOpen={setModalOpen}
              setDocuments={setDocuments}
              setFilteredDocuments={setFilteredDocuments}
              showAlert={showAlert}
              id={id}
              url={url}
            />
          </div>
        </Fade>
      </Modal>
      {/* Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
        }}
        PaperProps={{
          sx: {
            width: {
              xs: "100%",
              sm: "75%",
              md: "50%",
            },
            padding: "20px",
          },
        }}
      >
        <DrawerContent
          item={item}
          setDrawerOpen={setDrawerOpen}
          setDocuments={setDocuments}
          setFilteredDocuments={setFilteredDocuments}
          showAlert={showAlert}
        />
      </Drawer>
    </div>
  );
}
