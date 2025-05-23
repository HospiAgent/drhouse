"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "next/navigation";
import parse from "html-react-parser";


import { useRouter } from "next/navigation";
import { render } from "react-dom";

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "Unknown";

  try {
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return "Invalid date";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age} years`;
  } catch (error) {
    console.error("Error calculating age:", error);
    return "Age calculation error";
  }
};
const formatLastVisit = (dateString) => {
  if (!dateString) return "No visit record";
  

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    // Format as dd/MM/yyyy
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

// Create a wrapper component that safely uses searchParams
function SearchParamsWrapper({ children }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function HealthMonitor() {
  const [showTranscription, setShowTranscription] = useState(false);

  const router = useRouter();
  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      localStorage.removeItem('drhouse_auth_token');
      sessionStorage.clear();
      
  
      
      toast.success('Logged out successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #0284c7',
        },
      });
      
      setTimeout(() => {
        router.push('/'); 
      }, 1000);
    }
  };
  const [activeMenu, setActiveMenu] = useState("patients");
  const [showDoctorProfile, setShowDoctorProfile] = useState(false);

  const [isPatientsDatabaseExpanded, setIsPatientsDatabaseExpanded] =
    useState(true);
  const [showProfile, setShowProfile] = useState(false); 
  const [showSidebar, setShowSidebar] = useState(false); 
  const [selectedChat, setSelectedChat] = useState(null); 
  const [assessmentState, setAssessmentState] = useState("not-started"); 
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAppointmentHistory, setShowAppointmentHistory] = useState(false);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    condition: "",
    dateOfBirth: "",
    gender: "Male",
  });

  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
  });
  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required";
    }

    // Strip out common formatting characters
    const cleanedPhone = phone
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    // This regex allows for phone numbers without special formatting
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatList, setShowChatList] = useState(false); // For mobile chat list toggle
  const [showPatientList, setShowPatientList] = useState(false); // For displaying patient list after clicking "Start assessing"
  const modalRef = useRef(null);
  const historyModalRef = useRef(null);
  const [soapResponse, setSoapResponse] = useState("");
  const [transcription, setTranscription] = useState("");
  const previousChatRef = useRef(selectedChat);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Sample chat data
  const [chats, setChats] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpeciality, setDoctorSpeciality] = useState("");
  const [doctorAddress, setDoctorAddress] = useState("");

  const getPatients = async () => {
    try {
      let all_patients = await axios.get(
        "https://hospital-be-q56g.onrender.com/get/patients",
      );
      var patients_data = all_patients.data;
      var patientAll = [];

      for (let i = 0; i < patients_data.length; i++) {
        var patient = patients_data[i];

        // Format the last visit date
        const formattedLastVisit = formatLastVisit(patient.last_visit);

        var patientObj = {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.contact,
          dateOfBirth: patient.birth_date,
          condition: patient?.medical_history?.conditions?.join(", "),
          gender: patient.gender,
          time: patient.last_visit, // Keep original format for internal use
          unread: 0,
          messages: [],
          message: "Last visit: " + formattedLastVisit, // Use formatted date in message
          time: "",
          soapResponse: null,
          transcription: null,
        };
        patientAll.push(patientObj);
      }
      setChats(patientAll);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  // Modified to accept searchParams as a parameter
  const decodeToken = (params) => {
    console.log(params);
    var token = params.get("token"); // Use get method to access params
    if (!token) {
      alert("No token found");
      return;
    }
    const decoded = jwtDecode(token);
    console.log(decoded);
    setDoctorId(decoded.id);
    setDoctorName(decoded.name);
    setDoctorSpeciality(decoded.speciality);
    setDoctorAddress(decoded.address);
  };

  // Add this for proper handling of mobile/desktop detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initialize isMobile state
    setIsMobile(window.innerWidth < 768);
    getPatients();
    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);

      if (window.innerWidth < 768) {
        setShowSidebar(false);
        setShowProfile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Fetch patients when component mounts
    getPatients();
  }, []);
  // Handle chat switching and auto-saving
  useEffect(() => {
    // If switching from a chat with unsaved SOAP response
    if (
      previousChatRef.current !== selectedChat &&
      soapResponse &&
      assessmentState === "completed"
    ) {
      // Find the previous chat
      const prevChat = chats.find(
        (chat) => chat.id === previousChatRef.current,
      );
      if (prevChat) {
        // Auto-save the SOAP for the previous chat
        addSoap(previousChatRef.current);
        toast.success(`SOAP note auto-saved for ${prevChat.name}`);
      }
    }

    // Update the SOAP response and transcription for the newly selected chat
    const currentChat = chats.find((chat) => chat.id === selectedChat);
    if (currentChat) {
      setSoapResponse(currentChat.soapResponse || "");
      setTranscription(currentChat.transcription || "");

      // If the current chat has a SOAP response, set assessment state to completed
      if (currentChat.soapResponse) {
        setAssessmentState("completed");
      } else {
        setAssessmentState("not-started");
      }
    }

    // On mobile, close the chat list when a chat is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false);
      setShowChatList(false);
    }

    // Update the ref for next change
    previousChatRef.current = selectedChat;
  }, [selectedChat]);

  const uploadAudio = async (blobUrl) => {
    try {
      // Fetch the Blob from the mediaBlobUrl
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      // Create FormData and append the blob as a file
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      // Post to backend
      const res = await axios.post(
        "https://hospital-be-q56g.onrender.com/v1/transcribe/audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Transcription successful!");
      const transcriptionText = res.data.transcription[0].text;
      setTranscription(transcriptionText);

      const patient_details = await axios.get(
        "https://hospital-be-q56g.onrender.com/single/patient?patient_id=" +
          selectedChat,
      );

      //Soap analysis
      const soapRequest = await axios.post(
        "https://monkfish-app-hnnle.ondigitalocean.app/api/analysis/soap-analysis",
        {
          transcription:
            "Patient details - " +
            JSON.stringify(patient_details) +
            " Transcription - " +
            transcriptionText,
        },
      );

      // The SOAP response is a JSON object with an id and data field
      let soap_response = soapRequest.data;

      soap_response = await cleanHTML(soap_response.data);
      soap_response = "<div>" + soap_response + "</div>";
      console.log(soap_response);
      setCleanSoap(soap_response);

      console.log("SOAP Response:", soap_response);
      setSoapResponse(soap_response);

      // Update the chats state to include the SOAP response for this chat
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat
            ? {
                ...chat,
                soapResponse: soap_response,
                transcription: transcriptionText,
              }
            : chat,
        ),
      );

      setAssessmentState("completed");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to process recording.");
      setAssessmentState("not-started");
    }
  };

  const {
    status,
    startRecording: startRecordingMedia,
    stopRecording: stopRecordingMedia,
    resumeRecording: resumeRecordingMedia,
    pauseRecording: pauseRecordingMedia,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    onStop: (blobUrl, blob) => {
      uploadAudio(blobUrl);
      setRecordingTime(0);
      setAssessmentState("summarizing");
    },
    onStart: () => {
      console.log("Recording started");
    },
  });

  const currentChat = chats.find((chat) => chat.id === selectedChat);

  // Start the recording timer
  useEffect(() => {
    if (assessmentState === "recording") {
      const interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
      setRecordingInterval(interval);
    } else {
      clearInterval(recordingInterval);
    }

    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
    };
  }, [assessmentState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartAssessment = () => {
    setAssessmentState("recording");
    setRecordingTime(0);
    startRecordingMedia();
  };

  const handleStartAssessingClick = () => {
    setShowPatientList(true);
    setIsPatientsDatabaseExpanded(true);
    // Show the patient list on all screen sizes
    setShowChatList(true);

    // Add a toast notification to guide the user
    toast.success("Please select a patient from the list", {
      duration: 3000,
      position: "top-center",
      style: {
        background: "#f0f9ff",
        color: "#0369a1",
        border: "1px solid #0284c7",
        padding: "16px",
        fontSize: "14px",
      },
      icon: "👨‍⚕️",
    });
  };

  const handlePauseAssessment = () => {
    if (assessmentState === "recording") {
      setAssessmentState("paused");
      pauseRecordingMedia();
    } else if (assessmentState === "paused") {
      setAssessmentState("recording");
      resumeRecordingMedia();
    }
  };

  const handleEndAssessment = () => {
    if (recordingTime < 3) {
      // If recording is less than 1 minute (60 seconds)
      toast.error(
        "Dr.House AI needs a brief conversation to generate notes. Please continue for at least 30 seconds.",
        {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #ef4444",
            padding: "16px",
            fontSize: "14px",
          },
          icon: "⚠️",
        },
      );
      return; // Prevent ending the assessment
    }

    // Only proceed if recording time is at least 1 minute
    stopRecordingMedia();
    setAssessmentState("summarizing");
  };

  const handleReset = () => {
    clearBlobUrl();
    setAssessmentState("not-started");
    setRecordingTime(0);

    // Clear SOAP response for the current chat
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === selectedChat
          ? { ...chat, soapResponse: null, transcription: null }
          : chat,
      ),
    );
    setSoapResponse("");
    setTranscription("");
  };

  const handleContinueAssessment = () => {
    setAssessmentState("not-started");
  };

  // Handle Add Patient Modal
  const openAddPatientModal = () => {
    setShowAddPatientModal(true);
  };

  const closeAddPatientModal = () => {
    setShowAddPatientModal(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      condition: "",
    });
  };

  // New unified input handler for form fields
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;

    // Store the name of the current field being edited
    setFocusedField(name);

    // Update the patient state
    setNewPatient((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate specific fields
    if (name === "email") {
      setValidationErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "phone") {
      setValidationErrors((prev) => ({
        ...prev,
        phone: validatePhone(value),
      }));
    }
  };

  // Add handler for country code
  const handleCountryCodeChange = (e) => {
    setNewPatient((prev) => ({
      ...prev,
      phoneCountryCode: e.target.value,
    }));
  };

  // Refs for input fields to maintain focus
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const dobInputRef = useRef(null);
  const conditionInputRef = useRef(null);
  const genderInputRef = useRef(null);

  // Keep track of which input field is currently focused
  const [focusedField, setFocusedField] = useState(null);

  // For outside click to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeAddPatientModal();
      }
      if (
        historyModalRef.current &&
        !historyModalRef.current.contains(event.target)
      ) {
        setShowHistoryModal(false);
      }
    }

    if (showAddPatientModal || showHistoryModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddPatientModal, showHistoryModal]);

  // Filter chats based on search query
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Recording animation component
  const RecordingAnimation = () => (
    <div className="flex items-center">
      <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
      <div className="text-gray-700">Listening...</div>
    </div>
  );
  // Appointment History Panel Component
  // Appointment History Panel Component
  const AppointmentHistoryPanel = ({ setShowAppointmentHistory }) => {
    // Filter patients who have at least one assessment (those with soapResponse)
    const patientsWithAssessments = React.useMemo(() => {
      return (
        chats
          // .filter(patient => patient.soapResponse  null)
          .sort((a, b) => {
            // Sort by last visit date descending
            const dateA = new Date(a.last_visit || 0);
            const dateB = new Date(b.last_visit || 0);
            return dateB - dateA;
          })
      );
    }, [chats]);

    return (
      <div className="md:w-72 border-l bg-white overflow-y-auto flex flex-col h-full">
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-2">
          <button
            onClick={() => setShowAppointmentHistory(false)}
            className="text-gray-500 p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="py-3 px-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="font-medium text-black">Appointment History</h2>
          <button
            onClick={() => setShowAppointmentHistory(false)}
            className="md:block hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {patientsWithAssessments.length === 0 ? (
            <div className="p-4 flex-1 flex flex-col items-center justify-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Appointments
              </h3>
              <p className="text-gray-500 text-sm text-center">
                There are no assessment records to display at this time.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {patientsWithAssessments.map((patient) => (
                <div
                  key={patient.id}
                  className="py-3 px-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedChat(patient.id);
                    setShowAppointmentHistory(false);
                  }}
                >
                  <div className="flex items-center mb-1">
                    <img
                      src="https://avatar.iran.liara.run/public/42"
                      alt="User"
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div className="font-medium text-gray-800">
                      {patient.name}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pl-11">
                    <div className="text-xs text-gray-500">
                      {patient.message}
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  const DoctorProfilePanel = ({
    doctorName,
    doctorSpeciality,
    doctorAddress,
    doctorId,
    setShowProfile,
  }) => {
    return (
      <div className="md:w-72 border-l bg-white overflow-y-auto flex flex-col h-full">
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-2">
          <button
            onClick={() => setShowProfile(false)}
            className="text-gray-500 p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="py-3 px-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="font-medium text-black">Doctor's Profile</h2>
          <button
            onClick={() => setShowProfile(false)}
            className="md:block hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {doctorName
                ? doctorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "Dr"}
            </div>
            <h3 className="text-black font-medium text-lg mt-4">
              {doctorName || "Doctor"}
            </h3>
            <div className="text-sm text-gray-500 mt-1 text-center">
              {doctorSpeciality || "Specialist"}
            </div>
            <div className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Active
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">Doctor ID</div>
              <div className="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
                <span className="font-medium">
                  {doctorId || "Not available"}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Specialization</div>
              <div className="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <span className="font-medium">
                  {doctorSpeciality || "General Medicine"}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Address</div>
              <div className="flex items-start text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{doctorAddress || "No address provided"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //Add Patient component
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [condition, setCondition] = useState("");

  // Replace individual form state variables with a single formData object
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    condition: "",
  });

  // Simplified Add Patient function
  const addPatient = async () => {
    if (
      !newPatient.name ||
      !newPatient.email ||
      !newPatient.phone ||
      !newPatient.dateOfBirth
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      let data = JSON.stringify({
        patient_name: newPatient.name,
        patient_email: newPatient.email,
        patient_phone: newPatient.phone,
        patient_birth_day: newPatient.dateOfBirth,
        patient_gender: newPatient.gender,
        patient_address: "123 Elm Street, Springfield, IL, 62701",
        patient_medical_history: newPatient.condition,
        patient_status: "active",
        patient_last_visit: new Date().toISOString(),
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://hospital-be-q56g.onrender.com/create/patient",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      let add_patient = await axios.request(config);
      toast.success("Patient added successfully!");

      // Refresh patient list after adding
      getPatients();
    } catch (error) {
      console.error("Failed to add patient:", error);
      toast.error("Failed to add patient.");
    }
  };

  useEffect(() => {
    if (focusedField && showAddPatientModal) {
      switch (focusedField) {
        case "name":
          nameInputRef.current?.focus();
          break;
        case "email":
          emailInputRef.current?.focus();
          break;
        case "phone":
          phoneInputRef.current?.focus();
          break;
        case "dateOfBirth":
          dobInputRef.current?.focus();
          break;
        case "condition":
          conditionInputRef.current?.focus();
          break;
        case "gender":
          genderInputRef.current?.focus();
          break;
        default:
          break;
      }
    }
  }, [newPatient, focusedField, showAddPatientModal]);

  const addSoap = async (patient_id) => {
    try {
      // Get the current SOAP response and transcription
      const currentChat = chats.find((chat) => chat.id === patient_id);
      const soapToSave = currentChat?.soapResponse || soapResponse;
      const transcriptionToSave = currentChat?.transcription || transcription;

      if (!soapToSave || !transcriptionToSave) {
        console.warn("No SOAP or transcription to save");
        return;
      }

      let data = JSON.stringify({
        patient_id: patient_id,
        soap_analysis: cleanSoap,
        transcription: text,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://hospital-be-q56g.onrender.com/insert/soap",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      let add_soap = await axios.request(config);
      toast.success("SOAP note added successfully!");
    } catch (error) {
      console.error("Failed to save SOAP note:", error);
      toast.error("Failed to save SOAP note.");
    }
  };

  // Function to fetch patient history
  const fetchPatientHistory = async (patientId) => {
    if (!patientId) {
      toast.error("No patient selected");
      return;
    }

    try {
      setIsLoadingHistory(true);
      const response = await axios.get(
        `https://hospital-be-q56g.onrender.com/all/soap?patient_id=${patientId}`,
      );

      if (response.data && Array.isArray(response.data)) {
        // Sort by date (ASC)
        const sortedData = response.data.sort((a, b) => {
          return new Date(a.created_at) - new Date(b.created_at);
        });

        // Filter to ensure only one entry per date
        const uniqueDatesData = [];
        const dateMap = new Map();

        sortedData.forEach((item) => {
          const date = new Date(item.created_at).toDateString();
          if (!dateMap.has(date)) {
            dateMap.set(date, true);
            uniqueDatesData.push(item);
          }
        });

        setPatientHistory(response?.data?.reverse());
      } else {
        setPatientHistory([]);
      }
    } catch (error) {
      console.error("Error fetching patient history:", error);
      toast.error("Failed to fetch patient history");
      setPatientHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Open patient history modal
  const openHistoryModal = () => {
    setShowHistoryModal(true);
    fetchPatientHistory(currentChat?.id);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const AddPatientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Add New Patient
          </h2>
          <button
            onClick={closeAddPatientModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="gender"
          >
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            ref={genderInputRef}
            value={newPatient.gender}
            onChange={handlePatientInputChange}
            onFocus={() => setFocusedField("gender")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non Binary">Non Binary</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            ref={nameInputRef}
            value={newPatient.name}
            onChange={handlePatientInputChange}
            onFocus={() => setFocusedField("name")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            ref={emailInputRef}
            value={newPatient.email}
            onChange={handlePatientInputChange}
            onFocus={() => setFocusedField("email")}
            className={`shadow appearance-none border ${validationErrors.email ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            placeholder="john@example.com"
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="phone"
          >
            Phone Number *
          </label>
          <div className="flex">
            <select
              value={newPatient.phoneCountryCode}
              onChange={handleCountryCodeChange}
              className="shadow appearance-none border rounded-l w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-r-0"
            >
              <option value="+91">+91 IN</option>
              <option value="+1">+1 US/CA</option>
              <option value="+44">+44 UK</option>

              <option value="+61">+61 AU</option>
              <option value="+86">+86 CN</option>
              <option value="+49">+49 DE</option>
              <option value="+33">+33 FR</option>
              <option value="+81">+81 JP</option>
              <option value="+52">+52 MX</option>
              <option value="+55">+55 BR</option>
              <option value="+971">+971 AE</option>
              <option value="+65">+65 SG</option>
            </select>
            <input
              type="tel"
              id="phone"
              name="phone"
              ref={phoneInputRef}
              value={newPatient.phone}
              onChange={handlePatientInputChange}
              onFocus={() => setFocusedField("phone")}
              className={`shadow appearance-none border ${validationErrors.phone ? "border-red-500" : "border-gray-300"} rounded-r w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="(555) 123-4567"
              required
            />
          </div>
          {validationErrors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.phone}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="dateOfBirth"
          >
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            ref={dobInputRef}
            value={newPatient.dateOfBirth}
            onChange={handlePatientInputChange}
            onFocus={() => setFocusedField("dateOfBirth")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="hidden"
            id="condition"
            name="condition"
            ref={conditionInputRef}
            value="empty"
            onChange={handlePatientInputChange}
            onFocus={() => setFocusedField("condition")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Diabetes, Hypertension"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={closeAddPatientModal}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={() => {
              addPatient();
              closeAddPatientModal();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Patient
          </button>
        </div>
      </div>
    </div>
  );

  const [note, setNote] = useState(
    currentChat?.soapResponse?.data || soapResponse?.data || "",
  );

  // If currentChat or soapResponse changes, update note accordingly
  useEffect(() => {
    var newData = cleanHTML(
      currentChat?.soapResponse?.data || soapResponse?.data || "",
    );

    setNote(newData || "");
  }, [currentChat, soapResponse]);

  // Patient History Modal Component
  // Patient History Modal Component with improved formatting
  // Patient History Modal Component with improved formatting
  const PatientHistoryModal = () => {
    // Function to format SOAP data with proper structure
    const formatSoapData = (rawData) => {
      if (!rawData) return "No SOAP data available";

      // Remove markdown formatting if present
      let processedData = rawData
        .replace(/#{1,6}\s/g, "") // Remove heading markers
        .replace(/\*\*/g, "") // Remove bold markers
        .replace(/\*/g, "") // Remove italic markers
        .replace(/`/g, "") // Remove code markers
        .replace(/>/g, "") // Remove blockquote markers
        .trim();

      return processedData;
    };

    // Function to format SOAP data into sections
    const formatSoapSections = (soapData) => {
      if (!soapData) return { S: "", O: "", A: "", P: "" };

      // Try to identify sections by labels
      const sections = {
        S: "",
        O: "",
        A: "",
        P: "",
      };

      try {
        // Look for S: O: A: P: patterns in the text
        const sMatch = soapData.match(/\bS[\s]*:([^O]*)/i);
        const oMatch = soapData.match(/\bO[\s]*:([^A]*)/i);
        const aMatch = soapData.match(/\bA[\s]*:([^P]*)/i);
        const pMatch = soapData.match(/\bP[\s]*:(.*)/is);

        if (sMatch) sections.S = sMatch[1].trim();
        if (oMatch) sections.O = oMatch[1].trim();
        if (aMatch) sections.A = aMatch[1].trim();
        if (pMatch) sections.P = pMatch[1].trim();

        // If no sections were found, put everything in Assessment
        if (!sections.S && !sections.O && !sections.A && !sections.P) {
          sections.A = soapData;
        }
      } catch (error) {
        console.error("Error parsing SOAP sections:", error);
        sections.A = soapData;
      }

      return sections;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          ref={historyModalRef}
          className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Assessment History for {currentChat?.name}
            </h2>
            <button
              onClick={() => {
                setShowHistoryModal(false);
                setShowAppointmentHistory(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-64">
                <svg
                  className="animate-spin h-10 w-10 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-3 text-gray-600">
                  Loading patient history...
                </span>
              </div>
            ) : patientHistory.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400 mb-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-xl font-medium mb-2">
                  No medical history available
                </p>
                <p className="text-gray-500">
                  This patient doesn't have any recorded SOAP notes yet.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {patientHistory.map((historyItem, index) => {
                  // Format the SOAP data
                  let soapData = "";
                  try {
                    soapData = historyItem.soap_analysis || "";
                  } catch (e) {
                    console.error("Error processing SOAP analysis:", e);
                    soapData = "Error processing SOAP data";
                  }

                  // Format the SOAP data into sections
                  const cleanedData = formatSoapData(soapData);
                  let soapSections = formatSoapSections(cleanedData)

                  return (
                    <div
                      key={historyItem.id}
                      className={`${index !== 0 ? "pt-8" : "pt-2"} pb-8`}
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-xl text-gray-800">
                            SOAP Note
                          </div>
                          <div className="text-gray-500">
                            {formatDate(historyItem.created_at)}
                          </div>
                        </div>

                        {/* Print button (optional) */}
                       
                      </div>

                      <div className="bg-white border rounded-lg shadow-sm mb-6 overflow-hidden">
                        <div className="border-b bg-gray-50 px-6 py-3">
                          <h3 className="font-medium text-gray-800">
                            SOAP Analysis
                          </h3>
                        </div>

                        <div className="p-6">
                          {/* Subjective Section */}

                          <div className="pl-4 text-gray-800 leading-relaxed">
                            {parse(soapData)}
                          </div>
                       

                         
                        </div>
                      </div>

                      <div className="bg-white border rounded-lg shadow-sm">
                        <div className="border-b bg-gray-50 px-6 py-3">
                          <h3 className="font-medium text-gray-800">
                            Transcription
                          </h3>
                        </div>
                        <div className="p-6 text-gray-700 leading-relaxed">
                          {historyItem.transcription ||
                            "No transcription available"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
            <button
              onClick={() => {
                setShowHistoryModal(false);
                setShowAppointmentHistory(false);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [text, setText] = useState(transcription || "");

  useEffect(() => {
    setText(transcription || "");
  }, [transcription]);

  const [cleanSoap, setCleanSoap] = useState("");

  const cleanHTML = (data) => {
    // Only remove html, head, and body tags (opening and closing) while preserving other content
    const cleaned = data.replace(
      /<html[^>]*>|<\/html>|<head[^>]*>|<\/head>/gi,
      "",
    );
    return cleaned;
  };

  // Mobile Menu Bar Component
  const MobileMenuBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20 md:hidden">
      <div className="flex justify-around py-3">
        <button
          onClick={() => {
            setShowSidebar(!showSidebar);
            setShowProfile(false);
            setShowSidebar(false);
            setShowChatList(false);
          }}
          className="flex flex-col items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-xs mt-1">Menu</span>
        </button>

        <button
          onClick={() => {
            setShowChatList(!showChatList);
            setShowSidebar(false);
            setShowProfile(false);
          }}
          className="flex flex-col items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="text-xs mt-1">Patients</span>
        </button>

        <div
          className={`px-4 py-3 flex items-center cursor-pointer ${activeMenu === "profile" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
          onClick={() => {
            setShowAppointmentHistory(false);
            setActiveMenu("profile");
            setShowProfile(true);
            setShowDoctorProfile(true); // Set this to true when clicking the Profile menu
          }}
        >
          <div className="w-5 h-5 mr-3 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="font-medium">Profile</span>
        </div>

        <button
          onClick={openAddPatientModal}
          className="flex flex-col items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs mt-1">Add</span>
        </button>
      </div>
    </div>
  );

  // No Patient Selected UI Component
  const NoPatientSelectedUI = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Welcome to Dr.House AI
        </h2>
        <p className="text-gray-600 mb-8">
          Begin patient assessments and generate professional SOAP notes powered
          by AI.
        </p>
        <button
          onClick={handleStartAssessingClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center justify-center mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Start Assessing Using AI
        </button>
      </div>
    </div>
  );

  // Main component render with Suspense
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <SearchParamsWrapper>
        {(params) => {
          // Call the decodeToken function with the params from the wrapper
          React.useEffect(() => {
            decodeToken(params);
          }, [params]);

          return (
            <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
              {/* Left Sidebar - Hidden on mobile, shown when toggled or on desktop */}

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center">
                    <button
                      className="mr-4 md:hidden"
                      onClick={() => setShowSidebar(!showSidebar)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                    <h1 className="text-lg font-medium text-gray-800 truncate">
                      Dr.House AI
                    </h1>
                  </div>
                
                  <div className="hidden md:block relative"></div>
                
                  {/* Doctor Profile and Logout Button Container */}
                  <div className="flex items-center space-x-3">
                    {/* Doctor Profile Info */}
                    <div className="hidden md:flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        {doctorName
                          ? doctorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)
                          : "DC"}
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-sm text-black font-medium">
                          {doctorName || 'Doctor'}
                        </div>
                      </div>
                    </div>
                
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-red-200"
                      title="Logout"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 sm:mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 overflow-hidden relative">
                  {/* Chat List - Hidden on mobile, shown when toggled or on desktop */}
                  <div
                    className={`${showSidebar || showChatList ? "fixed inset-0 z-30 md:relative md:z-auto" : "hidden md:block"} md:w-72 border-r bg-white flex flex-col overflow-hidden`}
                  >
                    {/* Mobile close button */}
                    <div className="md:hidden flex justify-end p-2">
                      <button
                        onClick={() => {
                          setShowChatList(false);
                          setShowSidebar(false);
                        }}
                        className="text-gray-500 p-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="px-4 py-3 border-b flex-shrink-0">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="Search for patients..."
                          className="w-full text-black rounded-md border border-gray-300 py-2 px-4 pl-10 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Main Menu Items */}
                    <div className="overflow-y-auto flex-1">
                      {/* Appointment History */}
                      <div
                        className={`px-4 py-3 flex items-center cursor-pointer ${activeMenu === "appointments" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                        onClick={() => {
                          setActiveMenu("appointments");
                          setShowAppointmentHistory(true);
                        }}
                      >
                        <div className="w-5 h-5 mr-3 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">Appointment History</span>
                      </div>

                      {/* Patient Database - With expansion toggle */}
                      <div className="border-b">
                        <div
                          className={`px-4 py-3 flex items-center justify-between cursor-pointer ${activeMenu === "patients" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                          onClick={() => {
                            setActiveMenu("patients");
                            setIsPatientsDatabaseExpanded(
                              !isPatientsDatabaseExpanded,
                            );
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-3 flex-shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </div>
                            <span className="font-medium">
                              Patient Database
                            </span>
                          </div>
                          <div
                            className={`transform transition-transform ${isPatientsDatabaseExpanded ? "rotate-180" : ""}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Patient List - Only visible when expanded */}
                        {isPatientsDatabaseExpanded && (
                          <div className="bg-gray-50 py-1">
                            {/* Add Patient Button */}
                            <div className="px-4 py-2">
                              <button
                                onClick={openAddPatientModal}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition duration-200 text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Add New Patient
                              </button>
                            </div>

                            {/* Patient Items */}
                            {filteredChats.length === 0 ? (
                              <div className="px-12 py-4 text-center text-gray-500 text-sm">
                                No patients found
                              </div>
                            ) : (
                              filteredChats.map((chat) => (
                                <div
                                  key={chat.id}
                                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors ${selectedChat === chat.id ? "bg-blue-50" : ""}`}
                                  onClick={() => {
                                    setSelectedChat(chat.id);
                                    setShowDoctorProfile(false); // Reset doctor profile flag when a patient is selected

                                    if (window.innerWidth < 768) {
                                      setShowChatList(false);
                                    }
                                  }}
                                >
                                  <div className="flex items-center pl-8">
                                    <img
                                      src="https://avatar.iran.liara.run/public/42"
                                      alt="User"
                                      className="w-7 h-7 rounded-full mr-3"
                                    />
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <div
                                          className={`text-sm ${selectedChat === chat.id ? "font-bold text-blue-600" : "font-medium text-gray-800"}`}
                                        >
                                          {chat.name}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 truncate mt-0.5 pr-2">
                                        {chat.message}
                                      </div>
                                    </div>

                                    {/* Indicators */}
                                    {chat.soapResponse && (
                                      <div className="flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Profile Menu Item */}
                      <div
                        className={`px-4 py-3 flex items-center cursor-pointer ${activeMenu === "profile" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                        onClick={() => {
                          setShowAppointmentHistory(false);
                          setActiveMenu("profile");
                          setShowProfile(true);
                        }}
                      >
                        <div className="w-5 h-5 mr-3 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">Profile</span>
                      </div>

                      {/* Premium Menu Item */}
                      <div
                        className={`px-4 py-3 flex items-center cursor-pointer ${activeMenu === "premium" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                        onClick={() => router.push("dashboard")}
                      >
                        <div className="w-5 h-5 mr-3 flex-shrink-0 text-yellow-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">Premium</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Area - Assessment UI with properly controlled overflow */}
                  <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Chat Header - Only show if a patient is selected */}
                    {selectedChat && (
                      <div className="py-3 px-4 border-b bg-white flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center">
                          <img
                            src="https://avatar.iran.liara.run/public/42"
                            alt="User"
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="font-bold text-black">
                              {currentChat?.name || "Patient"}
                            </div>
                            <div className="text-xs text-gray-500">Patient</div>
                          </div>
                        </div>

                        {/* Profile toggle button (visible on medium screens and up) */}
                        <button
                          onClick={() => {
                            setShowProfile(!showProfile);
                            setShowDoctorProfile(false);
                            setActiveMenu("patients");
                          }}
                          className="hidden md:block text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* "Please select a patient" indicator after clicking Start Assessing */}
                    {showPatientList && !selectedChat && (
                      <div className="py-3 px-4 border-b bg-blue-50 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-bold text-blue-700">
                              Select a Patient
                            </div>
                            <div className="text-xs text-blue-600">
                              Please select a patient from the list or add a new
                              one
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={openAddPatientModal}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add Patient
                        </button>
                      </div>
                    )}

                    {/* Main Content Area - Display welcome screen or the assessment UI */}
                    <div className="flex-1 bg-gray-100 overflow-y-auto pb-16 md:pb-4">
                      {!selectedChat ? (
                        // No patient selected - show welcome screen or patient selection guide
                        showPatientList ? (
                          // After clicking "Start Assessing" but before selecting a patient
                          <div className="flex flex-col items-center justify-center h-full p-6">
                            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-8 w-8 text-blue-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <h2 className="text-xl font-bold text-gray-800 mb-3">
                                Please Select a Patient
                              </h2>
                              <p className="text-gray-600 mb-4">
                                Select an existing patient from the list or add
                                a new patient to begin the assessment.
                              </p>

                              {isMobile && (
                                <div className="flex justify-center mt-4">
                                  <button
                                    onClick={() => setShowChatList(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow transition duration-200 mr-2"
                                  >
                                    View Patients
                                  </button>
                                  <button
                                    onClick={openAddPatientModal}
                                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow transition duration-200"
                                  >
                                    Add New Patient
                                  </button>
                                </div>
                              )}

                              <div className="mt-8 text-sm text-gray-500">
                                <div className="flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  You'll find the patient list{" "}
                                  {isMobile
                                    ? 'by clicking "View Patients" above'
                                    : "on the left side of your screen"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Initial welcome screen
                          <NoPatientSelectedUI />
                        )
                      ) : (
                        assessmentState === "not-started" && (
                          <div className="p-4 flex items-center justify-center">
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-lg">
                              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                Patient Assessment
                              </h2>
                              <p className="text-gray-600 mb-6 text-center">
                                Start a new voice assessment for{" "}
                                {currentChat?.name || "Patient"}. You can record
                                your notes and diagnosis to be saved with the
                                patient record.
                              </p>

                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                  onClick={handleStartAssessment}
                                  className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                  </svg>
                                  Start Assessment
                                </button>

                                <button
                                  onClick={openHistoryModal}
                                  className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300 shadow-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  Previous History
                                </button>
                              </div>

                              <div className="text-xs text-gray-500 mt-6 text-center">
                                Status:{" "}
                                {status === "idle" ? (
                                  <span className="text-gray-400">
                                    Not recording
                                  </span>
                                ) : (
                                  <span className="text-green-500">
                                    {status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      {(assessmentState === "recording" ||
                        assessmentState === "paused") && (
                        <div className="p-4 flex items-center justify-center">
                          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-lg">
                            <div className="mb-8 flex flex-col items-center">
                              {/* Recording Animation - GREEN color */}
                              {assessmentState === "recording" ? (
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4">
                                  {/* Using more vibrant green colors */}
                                  <div className="absolute inset-0 bg-green-200 rounded-full"></div>
                                  <div className="absolute inset-2 bg-green-300 rounded-full animate-pulse"></div>
                                  <div
                                    className="absolute inset-4 bg-green-400 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.3s" }}
                                  ></div>
                                  <div
                                    className="absolute inset-6 bg-green-500 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.6s" }}
                                  ></div>
                                  <div className="absolute inset-8 bg-green-600 rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-full"></div>
                                </div>
                              )}
                              <div className="text-lg font-medium text-gray-800 mb-1">
                                {assessmentState === "recording"
                                  ? "Recording..."
                                  : "Paused"}
                              </div>
                              <div className="text-2xl font-bold">
                                {formatTime(recordingTime)}
                              </div>
                            </div>

                            <div className="flex space-x-4 sm:space-x-6 items-center">
                              {/* Pause/Resume Button */}
                              <button
                                onClick={handlePauseAssessment}
                                className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full ${
                                  assessmentState === "recording"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-green-500 hover:bg-green-600"
                                } text-white shadow-md transition duration-300`}
                                style={{ padding: 0 }} // Remove any padding that might be affecting the icon
                              >
                                {assessmentState === "recording" ? (
                                  /* Simplified, higher contrast PAUSE icon */
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="25"
                                    height="25"
                                    style={{ fill: "white" }}
                                  >
                                    <rect
                                      x="7"
                                      y="5"
                                      width="3"
                                      height="14"
                                      rx="1"
                                    />
                                    <rect
                                      x="14"
                                      y="5"
                                      width="3"
                                      height="14"
                                      rx="1"
                                    />
                                  </svg>
                                ) : (
                                  /* Simplified, higher contrast PLAY icon */
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="25"
                                    height="25"
                                    style={{ fill: "white" }}
                                  >
                                    <path d="M7 4v16l13-8z" />
                                  </svg>
                                )}
                              </button>
                              <span className="text-gray-700 text-sm font-medium">
                                {assessmentState === "recording"
                                  ? "Pause"
                                  : "Resume"}
                              </span>

                              {/* End Button */}
                              <button
                                onClick={handleEndAssessment}
                                className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition duration-300"
                                style={{ padding: 0 }} // Remove any padding that might be affecting the icon
                              >
                                {/* Simplified, higher contrast STOP icon */}
                                <svg
                                  viewBox="0 0 24 24"
                                  width="25"
                                  height="25"
                                  style={{ fill: "white" }}
                                >
                                  <rect x="6" y="6" width="12" height="12" />
                                </svg>
                              </button>
                              <span className="text-gray-700 text-sm font-medium">
                                End
                              </span>
                            </div>

                            <div className="text-xs text-gray-500 mt-8">
                              Status: {status}
                            </div>
                          </div>
                        </div>
                      )}

                      {assessmentState === "summarizing" && (
                        <div className="p-4 flex items-center justify-center">
                          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-lg">
                            <div className="mb-4">
                              <svg
                                className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </div>
                            <div className="text-lg font-medium text-gray-800 mb-2">
                              Summarizing your assessment...
                            </div>
                            <div className="text-sm text-gray-600 text-center">
                              Converting audio to text and generating summary
                            </div>
                          </div>
                        </div>
                      )}

                      {assessmentState === "completed" && (
                        <div className="p-4 flex items-center justify-center">
                          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-4xl overflow-y-auto">
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 mr-3">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                  </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                  SOAP Note Generated
                                </h2>
                              </div>

                              <div className="text-sm text-gray-500">
                                {new Date().toLocaleString()}
                              </div>
                            </div>

                            <div className="border rounded-lg mb-6 overflow-hidden">
                              <div className="bg-gray-50 px-4 py-3 border-b">
                                <h3 className="font-medium text-lg text-gray-800">
                                  Patient: {currentChat?.name || "Patient"}
                                </h3>
                              </div>
                            </div>

                            {/* SOAP Analysis */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-800">
                                  SOAP Analysis
                                </h3>
                                <button
                                  onClick={() => setIsEditMode(!isEditMode)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                                >
                                  {isEditMode ? "Cancel" : "Edit"}
                                </button>
                              </div>
                              {isEditMode ? (
                                <textarea
                                  className="bg-gray-50 text-black p-4 sm:p-6 pt-8 rounded border text-sm font-mono leading-relaxed mt-6 w-full h-60 resize-y overflow-x-auto whitespace-pre-wrap"
                                  value={cleanSoap.replace(
                                    /<\/?[^>]+(>|$)/g,
                                    "",
                                  )}
                                  onChange={(e) => setNote(e.target.value)}
                                  placeholder="Enter SOAP note here..."
                                />
                              ) : (
                                <div className="bg-gray-50 text-black p-4 sm:p-6 pt-8 rounded border text-sm font-mono leading-relaxed mt-6 w-full h-60 overflow-x-auto whitespace-pre-wrap">
                                  <div className="bg-gray-50 text-black p-4 sm:p-6 pt-8 rounded border text-sm font-mono leading-relaxed mt-6 w-full h-60 overflow-x-auto whitespace-pre-wrap">
                                    <div>
                                      {/* Parse and render the cleaned note directly */}
                                      {parse(cleanSoap)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Transcription - always visible but not editable */}
                            {mediaBlobUrl && (
                              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="font-medium text-gray-800 mb-2">
                                  Transcription
                                </h3>
                                <textarea
                                  className="bg-gray-50 text-black p-4 sm:p-6 pt-8 rounded border text-sm font-mono leading-relaxed mt-6 w-full h-60 resize-y overflow-x-auto whitespace-pre-wrap cursor-not-allowed"
                                  value={text}
                                  readOnly={true}
                                  placeholder="Transcription content..."
                                />
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                              <button
                                onClick={handleContinueAssessment}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              >
                                Continue Assessment
                              </button>
                              {isEditMode ? (
                                <button
                                  onClick={() => {
                                    setIsEditMode(false);
                                    toast.success(
                                      "SOAP note updated successfully!",
                                    );
                                  }}
                                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                  Save Changes
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    toast.loading(
                                      "Saving to patient record...",
                                      {
                                        duration: 2000,
                                        position: "top-right",
                                        style: {
                                          background: "#fff",
                                          color: "#000",
                                        },
                                      },
                                    );
                                    addSoap(currentChat.id);
                                  }}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                  Save to Patient Record
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Sidebar - Hidden on mobile, shown when toggled or on desktop */}
                  {/* Profile Sidebar - Hidden on mobile, shown when toggled or on desktop */}
                  {showProfile && (
                    <div
                      className={`${showProfile ? "fixed inset-0 z-30 bg-white md:relative md:z-auto md:bg-transparent" : "hidden"} md:w-72 border-l bg-white overflow-y-auto`}
                    >
                      {/* Logic for determining which profile to show */}
                      {activeMenu === "profile" ? (
                        // Always show doctor profile when coming from the sidebar menu
                        <DoctorProfilePanel
                          doctorName={doctorName}
                          doctorSpeciality={doctorSpeciality}
                          doctorAddress={doctorAddress}
                          doctorId={doctorId}
                          setShowProfile={setShowProfile}
                        />
                      ) : selectedChat ? (
                        // Show patient profile when patient is selected and clicked from header
                        <>
                          {/* Mobile close button */}
                          <div className="md:hidden flex justify-end p-2">
                            <button
                              onClick={() => setShowProfile(false)}
                              className="text-gray-500 p-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="py-3 px-4 border-b flex items-center justify-between flex-shrink-0">
                            <h2 className="font-medium text-black">
                              Patient Profile
                            </h2>
                            <button
                              onClick={() => setShowProfile(false)}
                              className="md:block hidden"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="p-4">
                            <div className="flex flex-col items-center">
                              <img
                                src="https://avatar.iran.liara.run/public/42"
                                alt="User"
                                className="w-24 h-24 rounded-full"
                              />
                              <h3 className="text-black font-medium text-lg mt-4">
                                {currentChat?.name}
                              </h3>

                              <div className="flex mt-4 w-full">
                                <button
                                  onClick={() => {
                                    toast.success("Coming soon");
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md py-2 text-xs text-gray-500 mr-2 flex items-center justify-center hover:bg-gray-50"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                  </svg>
                                  Send on whatsapp
                                </button>
                                <button
                                  onClick={() => {
                                    toast.success("Coming soon");
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md py-2 text-xs text-gray-500 flex items-center justify-center hover:bg-gray-50"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                    />
                                  </svg>
                                  Send on email
                                </button>
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className="text-xs text-gray-500 mb-2">
                                Email address
                              </div>
                              <div className="flex items-center text-sm text-blue-500 mb-4 break-all">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {currentChat?.email}
                              </div>

                              <div className="text-xs text-gray-500 mb-2">
                                Phone
                              </div>
                              <div className="flex items-center text-sm mb-4 text-black">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                {currentChat?.phone}
                              </div>

                              <div className="text-xs text-gray-500 mb-2">
                                Date of Birth
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                Age
                              </div>
                              <div className="flex items-center text-sm mb-4 text-black">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  {calculateAge(currentChat?.dateOfBirth)}
                                </span>
                              </div>

                              <div className="text-xs text-gray-500 mb-2">
                                Gender
                              </div>
                              <div className="flex items-center text-sm mb-4 text-black">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {currentChat?.gender || "Not specified"}
                              </div>

                              {/* Show Past History Button */}
                              <button
                                onClick={openHistoryModal}
                                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition duration-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                Show Past History
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Default to doctor profile if no patient selected
                        <DoctorProfilePanel
                          doctorName={doctorName}
                          doctorSpeciality={doctorSpeciality}
                          doctorAddress={doctorAddress}
                          doctorId={doctorId}
                          setShowProfile={setShowProfile}
                        />
                      )}
                    </div>
                  )}

                  {/* Appointment History Sidebar */}
                  {showAppointmentHistory && (
                    <div
                      className={`fixed inset-0 z-30 bg-white md:relative md:z-auto md:bg-transparent md:w-72 border-l bg-white overflow-y-auto`}
                    >
                      <AppointmentHistoryPanel
                        setShowAppointmentHistory={setShowAppointmentHistory}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Bar */}

              {/* Add Patient Modal */}
              {showAddPatientModal && <AddPatientModal />}

              {/* Patient History Modal */}
              {showHistoryModal && <PatientHistoryModal />}

              <Toaster />
            </div>
          );
        }}
      </SearchParamsWrapper>
    </Suspense>
  );
}
