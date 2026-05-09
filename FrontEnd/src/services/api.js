const API_URL = 'http://localhost:5000/api';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Helper function to get auth headers for protected routes
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

export const getPlacementTrends = async () => {
  const response = await fetch(`${API_URL}/dashboard/placement-trends`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch placement trends');
  return response.json();
};

export const getRecentActivities = async () => {
  const response = await fetch(`${API_URL}/dashboard/recent-activities`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch recent activities');
  return response.json();
};

export const getPendingApprovals = async () => {
  const response = await fetch(`${API_URL}/dashboard/pending-approvals`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch pending approvals');
  return response.json();
};

export const getCompletionRate = async () => {
  const response = await fetch(`${API_URL}/dashboard/completion-rate`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch completion rate');
  return response.json();
};

// Students API
export const getStudents = async () => {
  const response = await fetch(`${API_URL}/students`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

export const createStudent = async (studentData) => {
  const response = await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });
  if (!response.ok) throw new Error('Failed to create student');
  return response.json();
};

export const updateStudent = async (id, studentData) => {
  const response = await fetch(`${API_URL}/students/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });
  if (!response.ok) throw new Error('Failed to update student');
  return response.json();
};

export const deleteStudent = async (id) => {
  const response = await fetch(`${API_URL}/students/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete student');
  return response.json();
};

// Supervisors API
export const getSupervisors = async () => {
  const response = await fetch(`${API_URL}/supervisors`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch supervisors');
  return response.json();
};

export const createSupervisor = async (supervisorData) => {
  const response = await fetch(`${API_URL}/supervisors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supervisorData),
  });
  if (!response.ok) throw new Error('Failed to create supervisor');
  return response.json();
};

export const updateSupervisor = async (id, supervisorData) => {
  const response = await fetch(`${API_URL}/supervisors/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(supervisorData),
  });
  if (!response.ok) throw new Error('Failed to update supervisor');
  return response.json();
};

export const deleteSupervisor = async (id) => {
  const response = await fetch(`${API_URL}/supervisors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete supervisor');
  return response.json();
};

// Reports API
export const getDashboardSummary = async () => {
  const response = await fetch(`${API_URL}/reports/dashboard-summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard summary');
  return response.json();
};

export const downloadDashboardReport = async () => {
  const response = await fetch(`${API_URL}/reports/download-pdf`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to download report');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Internship_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const downloadStudentsReport = async () => {
  const response = await fetch(`${API_URL}/reports/students-pdf`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to download students report');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Student_Directory_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const getStudentsPerHospital = async () => {
  const response = await fetch(`${API_URL}/reports/students-per-hospital`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch students per hospital');
  return response.json();
};

export const getInternshipStatusBreakdown = async () => {
  const response = await fetch(`${API_URL}/reports/internship-status`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch internship status');
  return response.json();
};

export const getSupervisorSummary = async () => {
  const response = await fetch(`${API_URL}/reports/supervisor-summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch supervisor summary');
  return response.json();
};

// Hospitals API
export const getHospitals = async () => {
  const response = await fetch(`${API_URL}/hospitals`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  return response.json();
};

export const createHospital = async (hospitalData) => {
  const response = await fetch(`${API_URL}/hospitals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(hospitalData),
  });
  if (!response.ok) throw new Error('Failed to create hospital');
  return response.json();
};

export const updateHospital = async (id, hospitalData) => {
  const response = await fetch(`${API_URL}/hospitals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(hospitalData),
  });
  if (!response.ok) throw new Error('Failed to update hospital');
  return response.json();
};

export const deleteHospital = async (id) => {
  const response = await fetch(`${API_URL}/hospitals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete hospital');
  return response.json();
};

// Groups API
export const getGroups = async () => {
  const response = await fetch(`${API_URL}/groups`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch groups');
  return response.json();
};

export const createGroup = async (groupData) => {
  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(groupData),
  });
  if (!response.ok) throw new Error('Failed to create group');
  return response.json();
};

export const updateGroup = async (id, groupData) => {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(groupData),
  });
  if (!response.ok) throw new Error('Failed to update group');
  return response.json();
};

export const deleteGroup = async (id) => {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete group');
  return response.json();
};

export const addStudentsToGroup = async (groupId, studentIds) => {
  const response = await fetch(`${API_URL}/groups/${groupId}/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ studentIds }),
  });
  if (!response.ok) throw new Error('Failed to add students to group');
  return response.json();
};

// Assignments API
export const getAssignments = async () => {
  const response = await fetch(`${API_URL}/assignments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch assignments');
  return response.json();
};

export const createAssignment = async (assignmentData) => {
  const response = await fetch(`${API_URL}/assignments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData),
  });
  if (!response.ok) throw new Error('Failed to create assignment');
  return response.json();
};

export const updateAssignment = async (id, assignmentData) => {
  const response = await fetch(`${API_URL}/assignments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData),
  });
  if (!response.ok) throw new Error('Failed to update assignment');
  return response.json();
};

export const deleteAssignment = async (id) => {
  const response = await fetch(`${API_URL}/assignments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete assignment');
  return response.json();
};
//sitting

export const getSettings = async (token) => {
  const res = await fetch(`${API_URL}/settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const updateSettings = async (data, token) => {
  const res = await fetch(`${API_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
