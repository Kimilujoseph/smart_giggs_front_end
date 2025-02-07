import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import {
  Camera,
  Edit,
  Mail,
  Phone,
  UserIcon,
  Pencil,
  Info,
} from 'lucide-react';

import ClickOutside from '../ClickOutside';
import { User } from '../../types/user';
import { Avatar } from '@mui/material';
import Message from '../alerts/Message';

interface PersonalInformationProps {
  userProfile: User;
  refreshUserData: () => void;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  userProfile,
  refreshUserData,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const initialProfile = {
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    profileimage: userProfile.profileimage,
  };
  const [newUserProfile, setNewUserProfile] = useState({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      profileimage: userProfile.profileimage,
    });
  const [disabledFields, setDisabledFields] = React.useState<{
    name: boolean;
    email: boolean;
    phone: boolean;
  }>({
    name: true,
    email: true,
    phone: true,
  });
  const [message, setMessage] = React.useState<{
    text: string;
    type: string;
  } | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Handling input change', e.target.name, e.target.value);
    
    const { name, value } = e.target;
    setNewUserProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;

    if (files && files[0]) {
      const reader = new FileReader();
      const fileUrl: any = URL.createObjectURL(files[0]); // Generate a temporary preview URL

      setNewUserProfile((prev) => ({ ...prev, profileimage: files[0] }));

      reader.onloadend = () => {
        setProfilePreview(fileUrl as string);
      };

      reader.readAsDataURL(files[0]);

      console.log('Handling image upload', files[0]);
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
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

      if (
        newUserProfile &&
        (newUserProfile.email !== userProfile.email ||
        newUserProfile.phone !== userProfile.phone ||
        newUserProfile.name !== userProfile.name)
      ) {
        const formData = new FormData();
        formData.append('name', newUserProfile.name || userProfile.name);
        formData.append('phone', newUserProfile.phone || userProfile.phone);
        formData.append('email', newUserProfile.email || userProfile.email);

        console.log(newUserProfile.email !== userProfile.email, newUserProfile.phone !== userProfile.phone, newUserProfile.name !== userProfile.name);
        

        // console.log(
        //   `Profile: ${JSON.stringify({
        //     // name: formData.get('name'),
        //     // phone: formData.get('phone'),
        //     // email: formData.get('email'),
        //     name: newUserProfile.name,
        //     phone: newUserProfile.phone,
        //     email: newUserProfile.email
        //   })}`,
        // );
        console.log(newUserProfile);
        

        console.log(
          `Initial Profile Details: ${JSON.stringify({
            name: userProfile.name,
            phone: userProfile.phone,
            email: userProfile.email
          })}`,
        );
      }

      if (newUserProfile !== userProfile) {
        const formData = new FormData();
        formData.append('name', newUserProfile.name || userProfile.name);
        formData.append('phone', newUserProfile.phone || userProfile.phone);
        // formData.append('email', newUserProfile.email);

        profileResponse = await axios.put(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/update/profile`,
          {
            name: formData.get('name'),
            phone: formData.get('phone'),
            // email: formData.get('email'),
          },
          {
            withCredentials: true,
          },
        );
        if (profileResponse?.status === 200) {
          refreshUserData();
        }
      }

      if (newUserProfile.profileimage instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('images', newUserProfile.profileimage);

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
        (profileImageResponse && profileImageResponse.status !== 201)
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
      setProfilePreview(null);
      refreshUserData();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-whiten dark:bg-boxdark-2 rounded-lg">
      {/* Profile Photo Section */}
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Profile Photo
        </h2>
        <div className="flex flex-col justify-center items-center space-y-4 h-full w-full pb-4">
          <div className="relative bg-slate-500 rounded-full h-18 w-18 md:w-32 md:h-32">
            <Avatar
              src={profilePreview || `${userProfile.profileimage as string}`}
              alt={userProfile.name}
              className='bg-red-400'
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: "transparent",
                fontSize: '2rem'
              }}
              // className="w-24 h-24 md:w-100 md:h-100 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90"
            >
              <Pencil className="w-2 h-2 md:w-4 md:h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              name="profileimage"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <p className="text-sm text-center text-gray-500">
            Click the edit button to update your photo
          </p>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow p-6 md:col-span-2">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Personal Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Full Name</label>
                <Edit
                  onClick={() => handleEdit('name')}
                  className="h-5 w-5 text-primary"
                />
              </div>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <ClickOutside
                  onClick={() =>
                    setDisabledFields((prev) => ({ ...prev, name: true }))
                  }
                >
                  <input
                    type="text"
                    name="name"
                    value={newUserProfile.name || userProfile.name || ''}
                    onChange={handleInputChange}
                    className={`w-full pl-10 bg-white dark:bg-boxdark w-full rounded-md focus:border-primary px-3 py-2 outline-none
                        ${disabledFields.name ? '' : 'border border-gray-300'}`}
                    disabled={disabledFields.name}
                    placeholder="John Doe"
                  />
                </ClickOutside>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2 col col-span-2 md:col-span-1">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Phone Number</label>
                <Edit
                  onClick={() => handleEdit('phone')}
                  className="h-5 w-5 text-primary"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <ClickOutside
                  onClick={() =>
                    setDisabledFields((prev) => ({ ...prev, phone: true }))
                  }
                >
                  <input
                    type="tel"
                    name="phone"
                    value={newUserProfile.phone || userProfile.phone || ''}
                    onChange={handleInputChange}
                    className={`w-full pl-10 bg-white dark:bg-boxdark w-full rounded-md focus:border-primary px-3 py-2 outline-none
                        ${
                          disabledFields.phone ? '' : 'border border-gray-300'
                        }`}
                    disabled={disabledFields.phone}
                    placeholder="+254712345678"
                  />
                </ClickOutside>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Email Address</label>
                {/* <Edit
                      onClick={() => handleEdit('email')}
                      className="h-5 w-5 text-primary"
                    /> */}
                <div className="text-xs text-yellow-500 flex gap-1 items-center">
                  <Info className="h-3 w-3 text-yellow-500" />
                  Email editing is disabled
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <ClickOutside
                  onClick={() =>
                    setDisabledFields((prev) => ({ ...prev, email: true }))
                  }
                >
                  <input
                    type="email"
                    name="email"
                    value={userProfile.email}
                    onChange={() => void 0}
                    className={`w-full pl-10 bg-white dark:bg-boxdark w-auto rounded-md focus:border-primary px-3 py-2 outline-none`}
                    disabled
                    placeholder="johndoe@example.com"
                  />
                </ClickOutside>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            {/* <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button> */}
            <button
              type="submit"
              className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80
                    ${submitting ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInformation;