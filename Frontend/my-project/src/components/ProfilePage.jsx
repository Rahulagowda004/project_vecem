import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Typography,
  List,
  Accordion,
  AccordionHeader,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") || "/avatars/default.png"
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || user?.name || "Default Name"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [showProfileInfo, setShowProfileInfo] = useState(true);
  const [datasetCount, setDatasetCount] = useState(12); // Replace with dynamic dataset count
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [showDatasetForm, setShowDatasetForm] = useState(false); // State to toggle dataset form

  const avatars = [
    "/avatars/avatar1.png",
    "/avatars/avatar2.png",
    "/avatars/avatar3.png",
    "/avatars/avatar4.png",
  ];

  const allowedFileTypes = [
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Sidebar component (Multi-level)
  const [open, setOpen] = useState(0);
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center text-black mt-10">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="text-center text-white mt-10">
        <Typography variant="h6">Please log in to view your profile.</Typography>
      </div>
    );
  }

  const handleAvatarSelect = (avatar) => {
    if (avatar) {
      const avatarPath = encodeURI(avatar);
      localStorage.setItem("userAvatar", avatarPath);
      setSelectedAvatar(avatarPath);
    }
  };

  const handleNameChange = (e) => setUserName(e.target.value);

  const handleSave = () => {
    if (userName) {
      localStorage.setItem("userName", userName);
      setIsEditing(false);
      setShowAvatarGrid(false);
    }
  };

  const handleProfileClick = () => {
    setShowProfileInfo(!showProfileInfo); // Toggle profile info visibility
  };

  const handleDatasetSubmit = (e) => {
    e.preventDefault();
    // Handle dataset submission logic here
    console.log("Dataset Name:", datasetName);
    console.log("Dataset Description:", datasetDescription);
    console.log("Selected File:", selectedFile);
    setShowDatasetForm(false);
    setDatasetName("");
    setDatasetDescription("");
    setSelectedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert("Invalid file type. Please select a valid file.");
    }
  };

  useEffect(() => {
    if (!userName || !selectedAvatar) {
      setUserName(user?.name || "Default Name");
      setSelectedAvatar("/avatars/default.png");
    }

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 60000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [userName, selectedAvatar]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="h-auto w-80 p-4 shadow-xl shadow-blue-gray-900/5 bg-red-400 text-black">
        <div className="mb-2 p-4">
          <Typography variant="h5" color="blue-gray">
            Vecem
          </Typography>
        </div>
        <List>
          <Accordion
            open={open === 1}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 1 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 1}>
              <AccordionHeader
                onClick={() => handleOpen(1)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <PresentationChartBarIcon className="h-5 w-5" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Dashboard
                </Typography>
              </AccordionHeader>
            </ListItem>
          </Accordion>
          <Accordion
            open={open === 2}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 2 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 2}>
              <AccordionHeader
                onClick={() => handleOpen(2)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <ShoppingBagIcon className="h-5 w-5" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  E-Commerce
                </Typography>
              </AccordionHeader>
            </ListItem>
          </Accordion>
          <ListItem>
            <ListItemPrefix>
              <InboxIcon className="h-5 w-5" />
            </ListItemPrefix>
            Inbox
            <ListItemSuffix>
              <Chip
                value="14"
                size="sm"
                variant="ghost"
                color="blue-gray"
                className="rounded-full"
              />
            </ListItemSuffix>
          </ListItem>
          <ListItem onClick={handleProfileClick}>
            <ListItemPrefix>
              <UserCircleIcon className="h-5 w-5" />
            </ListItemPrefix>
            Profile
          </ListItem>
          <ListItem>
            <ListItemPrefix>
              <Cog6ToothIcon className="h-5 w-5" />
            </ListItemPrefix>
            Settings
          </ListItem>
          <ListItem>
            <ListItemPrefix>
              <PowerIcon className="h-5 w-5" />
            </ListItemPrefix>
            Log Out
          </ListItem>
        </List>
      </div>

      {/* Main Profile Content */}
      <div className="flex-grow p-8 bg-gray-100">
        {/* Profile Header */}
        <div className="flex items-center mb-6">
          <img
            src={selectedAvatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mr-6"
          />
          <div>
            <Typography variant="h4" className="font-semibold mb-2">
              {userName}
            </Typography>
            <Typography variant="body2" color="blue-gray" className="mb-2">
              Member since 2022
            </Typography>
            <Typography variant="body2" color="blue-gray">
              {currentTime}
            </Typography>
          </div>
        </div>

        {/* Profile Information */}
        {showProfileInfo && (
          <div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="font-semibold mb-4"
            >
              About Me
            </Typography>
            <Typography
              variant="body2"
              color="blue-gray"
              className="mb-4"
            >
              I am a data enthusiast with a passion for machine learning,
              artificial intelligence, and data visualization. Always looking
              for new challenges and opportunities to learn.
            </Typography>

            <Typography
              variant="h6"
              color="blue-gray"
              className="font-semibold mb-4"
            >
              Recent Activity
            </Typography>
            <List>
              <ListItem className="p-2">
                <Typography variant="body2" color="blue-gray">
                  Total Datasets Uploaded: <strong>{datasetCount}</strong>
                </Typography>
              </ListItem>
            </List>

            {/* Button to toggle dataset upload form */}
            <Button
              class="large-button"
            
              style={{
                width: "200px",
                height: "50px",
                color:"white",
                backgroundColor: "rgb(100,149,237)",
                borderRadius: "12px", 
              }}
              color="blue"
              onClick={() => {
                if (showDatasetForm) {
                  setDatasetName("");
                  setDatasetDescription("");
                  setSelectedFile(null);
                }
                setShowDatasetForm(!showDatasetForm);
              }}
              className="my-4"
            >
              {showDatasetForm ? "Cancel Upload" : "Upload a New Dataset"}
            </Button>

            {/* Dataset upload form */}
            {showDatasetForm && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Typography variant="h6" className="mb-4">
                  Upload a New Dataset
                </Typography>
                <form onSubmit={handleDatasetSubmit} className="p-6 border rounded-lg shadow-lg bg-white">
                <div className="mb-10">
  <label className="block mb-2 text-sm font-medium text-black">
    Dataset Name
  </label>
  <Input
    value={datasetName}
    onChange={(e) => setDatasetName(e.target.value)}
    required
    className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
  />
</div>
<div className="mb-5">
  <label className="block mb-2 text-sm font-medium text-gray-700">
    Dataset Description
  </label>
  <Textarea
    value={datasetDescription}
    onChange={(e) => setDatasetDescription(e.target.value)}
    required
    className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
  />
</div>
<div className="mb-5">
  <label className="block mb-2 text-sm font-medium text-gray-700">
    Upload File
  </label>
  <Input
    type="file"
    accept=".txt, .pdf, .docx"
    onChange={handleFileUpload}
    required
    className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
  />
</div>
<Button 
class="large-button" 
type="submit" 
color="blue"
style={{
  width: "200px",
  height: "50px",
  backgroundColor: "rgb(100,149,237)",
  borderRadius: "12px", 
}}
 >
  Submit Dataset
</Button>

</form>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
