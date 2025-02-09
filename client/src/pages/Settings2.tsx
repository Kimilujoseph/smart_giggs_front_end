import React, { useEffect, useRef, useState } from 'react';
import { Users, Upload } from 'lucide-react';
import axios, { AxiosResponse } from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../types/decodedToken';
import { useNavigate } from 'react-router-dom';
import PersonalInformation from '../components/settings/PersonalInformation';
import AccountSettings from '@/components/settings/AccountSettongs';

export interface UserProfileProps {
  name: string;
  phone: string;
  email: string;
  nextofkinname: string;
  nextofkinphonenumber: string;
  profileimage: string | File | null;
  password: string;
  backId: string;
  frontId: string;
  nextOfKinFrontId: string;
  nextOfKinBackId: string;
}

const Settings2 = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [frontIdPreview, setFrontIdPreview] = useState(null);
  const [backIdPreview, setBackIdPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const navigate = useNavigate();
  const [disabledFields, setDisabledFields] = useState({
    name: true,
    phone: true,
    email: true,
    nextofkinname: true,
    nextofkinphonenumber: true,
    profileimage: true,
    password: true,
    backId: true,
    frontId: true,
    nextOfKinFrontId: true,
    nextOfKinBackId: true,
  });

  const [userProfile, setUserProfile] = useState<{
    name: string;
    phone: string;
    email: string;
    nextofkinname: string;
    nextofkinphonenumber: string;
    profileimage: string | File | null;
    password: string;
    backId: string;
    frontId: string;
    nextOfKinFrontId: string;
    nextOfKinBackId: string;
  }>({
    name: '',
    phone: '',
    email: '',
    nextofkinname: '',
    nextofkinphonenumber: '',
    profileimage: null,
    password: '',
    backId: '',
    frontId: '',
    nextOfKinFrontId: '',
    nextOfKinBackId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (field: keyof typeof disabledFields) => {
    setDisabledFields((prev) => {
      const newDisabledFields = Object.keys(prev).reduce(
        (acc, key) => {
          acc[key as keyof typeof prev] = true;
          return acc;
        },
        {} as typeof prev,
      );
      return { ...newDisabledFields, [field]: false };
    });
  };

  const fetchUserData = async () => {
    try {
      const tokenObj = localStorage.getItem('tk');
      if (tokenObj) {
        const decoded = jwt_decode<DecodedToken>(tokenObj);
        // console.log(decoded.email);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${
            decoded.email
          }`,
          { withCredentials: true },
        );

        const {
          name,
          phone,
          nextofkinname,
          nextofkinphonenumber,
          email,
          profileimage,
        } = response.data.user;
        console.log(response.data.user);

        const userObj: any = {
          name,
          phone,
          nextofkinname,
          nextofkinphonenumber,
          email,
          profileimage,
          password: '',
          nextOfKinFrontId: '',
          nextOfKinBackId: '',
          frontId: '',
          backId: '',
        };
        setUserProfile(userObj);
        setFrontIdPreview(userObj.nextOfKinFrontId);
        setBackIdPreview(userObj.nextOfKinBackId);
      }
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  };

  const updateUserProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const tokenObj = localStorage.getItem('tk');
      if (!tokenObj) {
        localStorage.clear();
        return navigate('/auth/signin');
      }
      let [profileResponse, profileImageResponse]: [
        AxiosResponse | null,
        AxiosResponse | null,
      ] = [null, null];

      if (userProfile) {
        const formData = new FormData();
        formData.append('password', userProfile.password);
        formData.append('name', userProfile.name);
        formData.append('phone', userProfile.phone);
        formData.append('email', userProfile.email);
        formData.append('nextofkinname', userProfile.nextofkinname);
        formData.append(
          'nextofkinphonenumber',
          userProfile.nextofkinphonenumber,
        );

        profileResponse = await axios.put(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/update/profile`,
          {
            password: formData.get('password'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            nextofkinname: formData.get('nextofkinname'),
            nextofkinphonenumber: formData.get('nextofkinphonenumber'),
          },
          {
            withCredentials: true,
          },
        );
      }
      console.log(typeof userProfile.profileimage);

      if (userProfile.profileimage instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('images', userProfile.profileimage);

        console.log(
          `Image: ${JSON.stringify(
            imageFormData.get('profileimage') as object,
          )}`,
        );

        profileImageResponse = await axios.put(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/update/profilepicture`,
          imageFormData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      }

      if (
        (profileResponse && profileResponse.status !== 200) ||
        (profileImageResponse && profileImageResponse.status !== 200)
      ) {
        throw new Error(
          (profileResponse && profileResponse.data?.message) ||
            (profileImageResponse && profileImageResponse.data?.message) ||
            'Failed to update profile',
        );
      }
      setMessage({
        text: 'Profile updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error updating user profile', error);
      setMessage({
        text: error.response?.data.message || 'Failed to update profile',
        type: `${error.response?.status === 404 ? 'warning' : 'error'}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('Fetching user data');
    fetchUserData();
    console.log('User data fetched');
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      const fileUrl: any = URL.createObjectURL(files[0]); // Generate a temporary preview URL

      reader.onloadend = () => {
        setUserProfile((prev) => ({
          ...prev,
          [name]: file,
          [`${name}Preview`]: reader.result as string, // Ensure type safety for the file content
        }));
      };

      reader.readAsDataURL(files[0]);

      // Update the preview state based on the input field name
      if (name === 'nextOfKinFrontId') {
        setFrontIdPreview(fileUrl);
      } else if (name === 'nextOfKinBackId') {
        setBackIdPreview(fileUrl);
      } else if (name === 'profileimage') {
        console.log('Hanling image upload', file);
        setUserProfile((prev) => ({ ...prev, profileimage: file }));
      }
    }
  };

  useEffect(() => {
    console.log('profileimage', userProfile.profileimage);
  }, [userProfile.profileimage]);

  return (
    <div className="container mx-auto md:p-6 max-w-7xl">
      <h1 className="text-xl md:text-3xl font-bold mb-4">Account Settings</h1>

      {/* Tabs */}
      <div className="mb-6 w-full">
        <div className="flex space-x-1 rounded-xl bg-white dark:bg-boxdark h-12 px-1 w-full">
          {['profile', 'additional-Settings'].map((tab) => (
            <button
              key={tab}
              className={`w-full py-2.5 text-sm font-medium leading-5
                ${
                  activeTab === tab
                    ? 'border-b-2 border-b-primary text-primary'
                    : 'text-gray-700 dark:text-white hover:bg-white/[0.12] hover:text-gray-800'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <PersonalInformation
          userProfile={userProfile}
          refreshUserData={() => fetchUserData()}
        />
      )}

      {/* Security Tab Content */}
      {activeTab === 'additional-Settings' && (
        <AccountSettings refreshUserData={fetchUserData} />
      )}
    </div>
  );
};

export default Settings2;
