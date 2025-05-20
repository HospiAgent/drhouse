'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from 'next/navigation';

// Create a wrapper component that safely uses searchParams
function SearchParamsWrapper({ children }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function HealthMonitor() {
  const [showProfile, setShowProfile] = useState(false); // Hide profile by default on mobile
  const [showSidebar, setShowSidebar] = useState(false); // For mobile sidebar toggle
  const [selectedChat, setSelectedChat] = useState('lisa-montgomery');
  const [assessmentState, setAssessmentState] = useState('not-started'); // not-started, recording, paused, summarizing, completed
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    condition: '',
    dateOfBirth: '',
    gender: 'Male'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatList, setShowChatList] = useState(false); // For mobile chat list toggle
  const modalRef = useRef(null);
  const historyModalRef = useRef(null);
  const [soapResponse, setSoapResponse] = useState("");
  const [transcription, setTranscription] = useState("");
  const previousChatRef = useRef(selectedChat);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sample chat data
  const [chats, setChats] = useState([
    {
      id: 'joseph-berrington',
      name: 'Joseph Berrington',
      time: '08:23',
      message: 'Good afternoon, Doctor. I have a sore throat and a strange headache. What could it be?',
      unread: 2,
      messages: [],
      email: 'josephb@example.com',
      phone: '+1 555-123-4567',
      dateOfBirth: '04/15/1985',
      condition: 'Seasonal allergies',
      gender: 'Male',
      soapResponse: null,
      transcription: null
    }
  ]);

  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpeciality, setDoctorSpeciality] = useState("");
  const [doctorAddress, setDoctorAddress] = useState("");

  const getPatients = async () => {
    try {
      let all_patients = await axios.get("https://hospital-be-q56g.onrender.com/get/patients");
      var patients_data = all_patients.data;
      var patientAll = [];

      for (let i = 0; i < patients_data.length; i++) {
        var patient = patients_data[i];

        var patientObj = {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.contact,
          dateOfBirth: patient.birth_date,
          condition: patient?.medical_history?.conditions?.join(", "),
          gender: patient.gender,
          time: patient.last_visit,
          unread: 0,
          messages: [],
          message: "Last visit: " + patient.last_visit,
          time: '',
          soapResponse: null,
          transcription: null
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
    var token = params.get('token'); // Use get method to access params
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

  useEffect(() => {
    getPatients();

    // Close sidebar/profile on mobile when window is resized
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
        setShowProfile(false);
        setShowChatList(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle chat switching and auto-saving
  useEffect(() => {
    // If switching from a chat with unsaved SOAP response
    if (
      previousChatRef.current !== selectedChat &&
      soapResponse &&
      assessmentState === 'completed'
    ) {
      // Find the previous chat
      const prevChat = chats.find(chat => chat.id === previousChatRef.current);
      if (prevChat) {
        // Auto-save the SOAP for the previous chat
        addSoap(previousChatRef.current);
        toast.success(`SOAP note auto-saved for ${prevChat.name}`);
      }
    }

    // Update the SOAP response and transcription for the newly selected chat
    const currentChat = chats.find(chat => chat.id === selectedChat);
    if (currentChat) {
      setSoapResponse(currentChat.soapResponse || "");
      setTranscription(currentChat.transcription || "");

      // If the current chat has a SOAP response, set assessment state to completed
      if (currentChat.soapResponse) {
        setAssessmentState('completed');
      } else {
        setAssessmentState('not-started');
      }
    }

    // On mobile, close the chat list when a chat is selected
    if (window.innerWidth < 768) {
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
      formData.append('audio', blob, 'recording.webm');

      // Post to backend
      const res = await axios.post('https://hospital-be-q56g.onrender.com/v1/transcribe/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Transcription successful!');
      const transcriptionText = res.data.transcription[0].text;
      setTranscription(transcriptionText);

      //Soap analysis
      const soapRequest = await axios.post("https://monkfish-app-hnnle.ondigitalocean.app/api/analysis/soap-analysis", {
        "transcription": transcriptionText,
      });

      // The SOAP response is a JSON object with an id and data field
      const soap_response = soapRequest.data;
      console.log('SOAP Response:', soap_response);
      setSoapResponse(soap_response);

      // Update the chats state to include the SOAP response for this chat
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat
            ? { ...chat, soapResponse: soap_response, transcription: transcriptionText }
            : chat
        )
      );

      setAssessmentState('completed');

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to process recording.');
      setAssessmentState('not-started');
    }
  };

  const {
    status,
    startRecording: startRecordingMedia,
    stopRecording: stopRecordingMedia,
    resumeRecording: resumeRecordingMedia,
    pauseRecording: pauseRecordingMedia,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    onStop: (blobUrl, blob) => {
      console.log("Recording stopped");
      uploadAudio(blobUrl);
      setRecordingTime(0);
      setAssessmentState('summarizing');
    },
    onStart: () => {
      console.log("Recording started");
    }
  });

  const currentChat = chats.find(chat => chat.id === selectedChat) || chats[0];

  // Start the recording timer
  useEffect(() => {
    if (assessmentState === 'recording') {
      const interval = setInterval(() => {
        setRecordingTime(time => time + 1);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartAssessment = () => {
    setAssessmentState('recording');
    setRecordingTime(0);
    startRecordingMedia();
  };

  const handlePauseAssessment = () => {
    if (assessmentState === 'recording') {
      setAssessmentState('paused');
      pauseRecordingMedia();
    } else if (assessmentState === 'paused') {
      setAssessmentState('recording');
      resumeRecordingMedia();
    }
  };

  const handleEndAssessment = () => {
    stopRecordingMedia();
    setAssessmentState('summarizing');
  };

  const handleReset = () => {
    clearBlobUrl();
    setAssessmentState('not-started');
    setRecordingTime(0);

    // Clear SOAP response for the current chat
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat
          ? { ...chat, soapResponse: null, transcription: null }
          : chat
      )
    );
    setSoapResponse("");
    setTranscription("");
  };

  const handleContinueAssessment = () => {
    setAssessmentState('not-started');
  };

  // Handle Add Patient Modal
  const openAddPatientModal = () => {
    setShowAddPatientModal(true);
  };

  const closeAddPatientModal = () => {
    setShowAddPatientModal(false);
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      condition: '',
      dateOfBirth: '',
      gender: 'Male'
    });
  };

  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // For outside click to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeAddPatientModal();
      }
      if (historyModalRef.current && !historyModalRef.current.contains(event.target)) {
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
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recording animation component
  const RecordingAnimation = () => (
    <div className="flex items-center">
      <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
      <div className="text-gray-700">Listening...</div>
    </div>
  );

  //Add Patient component
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [condition, setCondition] = useState("");

  const addPatient = async () => {
    if (!name || !email || !phone || !dateOfBirth) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      let data = JSON.stringify({
        "patient_name": name,
        "patient_email": email,
        "patient_phone": phone,
        "patient_birth_day": dateOfBirth,
        "patient_gender": gender,
        "patient_address": "123 Elm Street, Springfield, IL, 62701",
        "patient_medical_history": condition,
        "patient_status": "active",
        "patient_last_visit": new Date().toISOString(),
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://hospital-be-q56g.onrender.com/create/patient',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      let add_patient = await axios.request(config);
      toast.success('Patient added successfully!');

      // Refresh patient list after adding
      getPatients();
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast.error('Failed to add patient.');
    }
  };

  const addSoap = async (patient_id) => {
    try {
      // Get the current SOAP response and transcription
      const currentChat = chats.find(chat => chat.id === patient_id);
      const soapToSave = currentChat?.soapResponse || soapResponse;
      const transcriptionToSave = currentChat?.transcription || transcription;

      if (!soapToSave || !transcriptionToSave) {
        console.warn('No SOAP or transcription to save');
        return;
      }

      let data = JSON.stringify({
        "patient_id": patient_id,
        "soap_analysis": soapToSave,
        "transcription": transcriptionToSave
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://hospital-be-q56g.onrender.com/insert/soap',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      let add_soap = await axios.request(config);
      toast.success('SOAP note added successfully!');
    } catch (error) {
      console.error('Failed to save SOAP note:', error);
      toast.error('Failed to save SOAP note.');
    }
  };

  // Function to fetch patient history
  const fetchPatientHistory = async (patientId) => {
    if (!patientId) {
      toast.error('No patient selected');
      return;
    }

    try {
      setIsLoadingHistory(true);
      const response = await axios.get(`https://hospital-be-q56g.onrender.com/all/soap?patient_id=${patientId}`);

      if (response.data && Array.isArray(response.data)) {
        // Sort by date (ASC)
        const sortedData = response.data.sort((a, b) => {
          return new Date(a.created_at) - new Date(b.created_at);
        });

        // Filter to ensure only one entry per date
        const uniqueDatesData = [];
        const dateMap = new Map();

        sortedData.forEach(item => {
          const date = new Date(item.created_at).toDateString();
          if (!dateMap.has(date)) {
            dateMap.set(date, true);
            uniqueDatesData.push(item);
          }
        });

        setPatientHistory(uniqueDatesData);
      } else {
        setPatientHistory([]);
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast.error('Failed to fetch patient history');
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Add Patient Modal Component
  const AddPatientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Add New Patient</h2>
          <button onClick={closeAddPatientModal} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            onChange={(e) => setGender(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="john@example.com"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
            Date of Birth *
          </label>
          <input
            type="text"
            id="dateOfBirth"
            name="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="MM/DD/YYYY"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="condition">
            Medical Condition
          </label>
          <input
            type="text"
            id="condition"
            name="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
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

  // Patient History Modal Component
  const PatientHistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={historyModalRef} className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Medical History: {currentChat?.name}</h2>
          <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : patientHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No medical history available</p>
              <p className="mt-2">This patient doesn't have any recorded SOAP notes yet.</p>
            </div>
          ) : (
            patientHistory.map((historyItem, index) => {
              // Parse the SOAP analysis JSON
              let soapData = "";
              try {
                const parsedSoap = JSON.parse(historyItem.soap_analysis);
                soapData = parsedSoap.data;
              } catch (e) {
                console.error("Error parsing SOAP analysis:", e);
                soapData = "Error parsing SOAP data";
              }

              return (
                <div key={historyItem.id} className={`border-b ${index !== 0 ? 'pt-6' : ''} pb-6`}>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-lg text-gray-800">SOAP Note</div>
                      <div className="text-sm text-gray-500">{formatDate(historyItem.created_at)}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="font-medium text-gray-700 mb-2">SOAP Analysis</div>
                    <div className="whitespace-pre-wrap text-sm font-mono text-gray-800 overflow-x-auto">
                      {soapData}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-700 mb-2">Transcription</div>
                    <div className="text-sm text-gray-800">
                      {historyItem.transcription}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Menu Bar Component
  const MobileMenuBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20 md:hidden">
      <div className="flex justify-around py-3">
        <button
          onClick={() => {
            setShowSidebar(!showSidebar);
            setShowProfile(false);
            setShowChatList(false);
          }}
          className="flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-xs mt-1">Patients</span>
        </button>

        <button
          onClick={() => {
            setShowProfile(!showProfile);
            setShowSidebar(false);
            setShowChatList(false);
          }}
          className="flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>

        <button
          onClick={openAddPatientModal}
          className="flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1">Add</span>
        </button>
      </div>
    </div>
  );

  // Main component render with Suspense
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SearchParamsWrapper>
        {(params) => {
          // Call the decodeToken function with the params from the wrapper
          React.useEffect(() => {
            decodeToken(params);
          }, [params]);

          return (
            <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
              {/* Left Sidebar - Hidden on mobile, shown when toggled or on desktop */}
              <div className={`${showSidebar ? 'fixed inset-0 z-30 md:relative md:z-auto' : 'hidden md:block'} md:w-48 bg-blue-950 text-white flex flex-col h-screen`}>
                {/* Mobile close button */}
                <div className="md:hidden flex justify-end p-2">
                  <button onClick={() => setShowSidebar(false)} className="text-white p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 flex items-center">
                  <div className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold">Health Monitor</div>
                    <div className="text-xs text-blue-300">Enterprise</div>
                  </div>
                </div>

                {/* User Profile */}
                <div className="flex flex-col items-center pb-4 border-b border-blue-900">
                  <div className="relative">
                    <img src="https://plus.unsplash.com/premium_photo-1658506671316-0b293df7c72b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdG9yfGVufDB8fDB8fHww" alt="User Avatar" className="rounded-full w-16 h-16" />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-medium">{doctorName}</div>
                    <div className="text-xs text-blue-300">{doctorSpeciality}</div>
                  </div>
                  <div className="mt-2 w-full px-4">
                    <button className="w-full bg-blue-600 py-1 px-3 rounded-md text-sm flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      940-837-5470
                    </button>
                  </div>

                </div>

                {/* Insurance Info */}
                <div className="px-4 py-2 text-xs">
                  <div className="text-blue-300 font-medium mb-1">Details</div>
                  <div className="mb-1 font-medium">Doctor id</div>
                  <div className="mb-1 text-gray-300">{doctorId}</div>
                </div>

                {/* Address Info */}
                <div className="px-4 py-2 text-xs border-t border-blue-900">
                  <div className="text-blue-300 font-medium mb-1">ADDRESS</div>
                  <div className="mb-1 font-medium">{doctorAddress}</div>
                </div>



                {/* Navigation Menu */}
                <div className="flex-1 mt-6">
                  <ul>

                    <li className="flex items-center px-4 py-3 hover:bg-blue-900 bg-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Communication center
                    </li>

                  </ul>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center">
                    <button className="mr-4 md:hidden" onClick={() => setShowSidebar(!showSidebar)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <h1 className="text-lg font-medium text-gray-800 truncate">Communication Center</h1>
                  </div>

                  <div className="hidden md:block relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center">
                  
                    <div className="hidden md:flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        DC
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-sm text-black font-medium">{doctorName}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 overflow-hidden relative">
                  {/* Chat List - Hidden on mobile, shown when toggled or on desktop */}
                  <div className={`${showChatList ? 'fixed inset-0 z-30 md:relative md:z-auto' : 'hidden md:block'} md:w-72 border-r bg-white flex flex-col overflow-hidden`}>
                    {/* Mobile close button */}
                    <div className="md:hidden flex justify-end p-2">
                      <button onClick={() => setShowChatList(false)} className="text-gray-500 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Tabs and Search */}
                    <div className="flex border-b flex-shrink-0">
                      <button className="flex-1 px-4 py-3 text-center text-sm font-medium text-blue-500 border-b-2 border-blue-500">
                        Chat
                      </button>
                      <div className="flex-1 px-4 py-3 flex items-center justify-center">
                        <div className="relative w-full">
                          <input
                            type="text"
                            placeholder="Search for..."
                            className="w-full font-black text-black rounded py-1 pl-8 pr-2 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <div className="absolute left-2 top-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add Patient Button */}
                    <div className="px-4 py-3 border-b flex-shrink-0">
                      <button
                        onClick={openAddPatientModal}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Patient
                      </button>
                    </div>

                    {/* Chat List with proper overflow */}
                    <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 147px)" }}>
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`border-b px-4 py-3 hover:bg-gray-50 cursor-pointer ${selectedChat === chat.id ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            setSelectedChat(chat.id);
                            if (window.innerWidth < 768) {
                              setShowChatList(false);
                            }
                          }}
                        >
                          <div className="flex">
                            <img src="https://avatar.iran.liara.run/public/42" alt="User" className="w-9 h-9 rounded-full mr-3" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="font-bold text-sm text-black">{chat.name}</div>
                                <div className="text-xs text-black">{chat.time}</div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {chat.message}
                              </div>
                            </div>
                          </div>
                          {chat.unread > 0 && (
                            <div className="mt-2 flex justify-end">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                {chat.unread}
                              </div>
                            </div>
                          )}
                          {/* Indicator for chats with SOAP notes */}
                          {chat.soapResponse && (
                            <div className="mt-1 flex justify-end">
                              <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                SOAP
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Area - Assessment UI with properly controlled overflow */}
                  <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Chat Header */}
                    <div className="py-3 px-4 border-b bg-white flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center">
                        <img src="https://avatar.iran.liara.run/public/42" alt="User" className="w-10 h-10 rounded-full mr-3" />
                        <div>
                          <div className="font-bold text-black">{currentChat?.name || "Patient"}</div>
                          <div className="text-xs text-gray-500">Patient</div>
                        </div>
                      </div>

                      {/* Profile toggle button (visible on medium screens and up) */}
                      <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="hidden md:block text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* New Assessment UI */}
                    <div className="flex-1 p-4 flex items-center justify-center bg-gray-100 overflow-y-auto pb-16 md:pb-4">
                      {assessmentState === 'not-started' && (
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-lg">
                          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Patient Assessment</h2>
                          <p className="text-gray-600 mb-6 text-center">
                            Start a new voice assessment for {currentChat?.name || "Patient"}. You can record your notes and diagnosis to be saved with the patient record.
                          </p>

                          <div className="flex justify-center">
                            <button
                              onClick={handleStartAssessment}
                              className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                              Start Assessment
                            </button>
                          </div>

                          {mediaBlobUrl && (
                            <div className="mt-6 border-t pt-4">
                              <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Recording</h3>
                              <div className="bg-gray-100 p-3 rounded-lg">
                                <audio src={mediaBlobUrl} controls className="w-full" />
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={handleReset}
                                    className="text-sm text-red-500 hover:text-red-700"
                                  >
                                    Delete Recording
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-6 text-center">
                            Status: {status || "Ready to record"}
                          </div>
                        </div>
                      )}

                      {(assessmentState === 'recording' || assessmentState === 'paused') && (
                        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-lg">
                          <div className="mb-8 flex flex-col items-center">
                            {assessmentState === 'recording' ? (
                              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4">
                                <div className="absolute inset-0 bg-red-100 rounded-full"></div>
                                <div className="absolute inset-2 bg-red-200 rounded-full animate-pulse"></div>
                                <div className="absolute inset-4 bg-red-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                                <div className="absolute inset-6 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                                <div className="absolute inset-8 bg-red-500 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-full"></div>
                              </div>
                            )}
                            <div className="text-lg font-medium text-gray-800 mb-1">
                              {assessmentState === 'recording' ? 'Recording...' : 'Paused'}
                            </div>
                            <div className="text-2xl font-bold">
                              {formatTime(recordingTime)}
                            </div>
                          </div>

                          <div className="flex space-x-4 sm:space-x-6">
                            <button
                              onClick={handlePauseAssessment}
                              className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full ${assessmentState === 'recording'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 hover:bg-green-600'
                                } text-white shadow-md transition duration-300`}
                            >
                              {assessmentState === 'recording' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M9 9h6v6H9z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>

                            <button
                              onClick={handleEndAssessment}
                              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition duration-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                              </svg>
                            </button>
                          </div>

                          <div className="text-xs text-gray-500 mt-8">
                            Status: {status}
                          </div>
                        </div>
                      )}

                      {assessmentState === 'summarizing' && (
                        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-lg">
                          <div className="mb-4">
                            <svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <div className="text-lg font-medium text-gray-800 mb-2">
                            Processing your assessment...
                          </div>
                          <div className="text-sm text-gray-600 text-center">
                            Converting audio to text and generating summary
                          </div>
                        </div>
                      )}

                      {assessmentState === 'completed' && (
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-4xl overflow-y-auto">
                          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </div>
                              <h2 className="text-xl font-bold text-gray-800">SOAP Note Generated</h2>
                            </div>

                            <div className="text-sm text-gray-500">
                              {new Date().toLocaleString()}
                            </div>
                          </div>

                          <div className="border rounded-lg mb-6 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                              <h3 className="font-medium text-lg text-gray-800">Patient: {currentChat?.name || "Patient"}</h3>
                            </div>
                            <div className="p-4 mt-6 pt-6">
                              <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                              {/* Display the formatted SOAP note with increased top padding */}
                              <div className="bg-gray-50 text-black p-4 sm:p-6 pt-8 rounded border text-sm whitespace-pre-wrap font-mono leading-relaxed mt-6 overflow-x-auto">
                                {currentChat?.soapResponse?.data || soapResponse?.data || "No SOAP note available"}
                              </div>
                            </div>
                          </div>

                          {mediaBlobUrl && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                              <h3 className="font-medium text-gray-800 mb-2">Assessment Audio</h3>
                              <audio src={mediaBlobUrl} controls className="w-full" />
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                            <button
                              onClick={handleContinueAssessment}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Continue Assessment
                            </button>
                            <button
                              onClick={() => {
                                toast.loading("Saving to patient record...", {
                                  duration: 2000,
                                  position: "top-right",
                                  style: {
                                    background: "#fff",
                                    color: "#000",
                                  },
                                });
                                addSoap(currentChat.id);

                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                              Save to Patient Record
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Sidebar - Hidden on mobile, shown when toggled or on desktop */}
                  {showProfile && (
                    <div className={`${showProfile ? 'fixed inset-0 z-30 bg-white md:relative md:z-auto md:bg-transparent' : 'hidden'} md:w-72 border-l bg-white overflow-y-auto`}>
                      {/* Mobile close button */}
                      <div className="md:hidden flex justify-end p-2">
                        <button onClick={() => setShowProfile(false)} className="text-gray-500 p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="py-3 px-4 border-b flex items-center justify-between flex-shrink-0">
                        <h2 className="font-medium text-black">Profile</h2>
                        <button onClick={() => setShowProfile(false)} className="md:block hidden">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex flex-col items-center">
                          <img src="https://avatar.iran.liara.run/public/42" alt="User" className="w-24 h-24 rounded-full" />
                          <h3 className="text-black font-medium text-lg mt-4">{currentChat?.name}</h3>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                            <span>Last visit at {currentChat?.last_visit} </span>
                          </div>

                          <div className="flex mt-4 w-full">
                            <button
                              onClick={() => {
                                toast.success("Coming soon");
                              }}

                              className="flex-1 border border-gray-300 rounded-md py-2 text-xs text-gray-500 mr-2 flex items-center justify-center hover:bg-gray-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Send on whatsapp
                            </button>
                            <button onClick={() => {
                              toast.success("Coming soon");
                            }} className="flex-1 border border-gray-300 rounded-md py-2 text-xs text-gray-500 flex items-center justify-center hover:bg-gray-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                              </svg>
                              Send on email
                            </button>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="text-xs text-gray-500 mb-2">Email address</div>
                          <div className="flex items-center text-sm text-blue-500 mb-4 break-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {currentChat?.email}
                          </div>

                          <div className="text-xs text-gray-500 mb-2">Phone</div>
                          <div className="flex items-center text-sm mb-4 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {currentChat?.phone}
                          </div>

                          <div className="text-xs text-gray-500 mb-2">Date of Birth</div>
                          <div className="flex items-center text-sm mb-4 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {currentChat?.dateOfBirth}
                          </div>

                          <div className="text-xs text-gray-500 mb-2">Gender</div>
                          <div className="flex items-center text-sm mb-4 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {currentChat?.gender || 'Not specified'}
                          </div>

                          <div className="text-xs text-gray-500 mb-2">Medical Condition</div>
                          <div className="flex items-center text-sm mb-4 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {currentChat?.condition || 'Not specified'}
                          </div>

                          {/* Show Past History Button */}
                          <button
                            onClick={openHistoryModal}
                            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Show Past History
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Bar */}
              <MobileMenuBar />

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