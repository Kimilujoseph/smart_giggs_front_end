import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Pencil,
  User,
  Phone,
  Mail,
  Users,
  Upload,
  Edit,
  Info,
} from 'lucide-react';
import axios, { AxiosResponse } from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../types/decodedToken';
import ClickOutside from '../components/ClickOutside';
import { useNavigate } from 'react-router-dom';
import PersonalInformation from '../components/settings/PersonalInformation';

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
          {['profile', 'security', 'next-of-kin'].map((tab) => (
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
        // <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-whiten dark:bg-boxdark-2 rounded-lg">
        //   {/* Profile Photo Section */}
        //   <div className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
        //     <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        //       <Camera className="w-5 h-5" />
        //       Profile Photo
        //     </h2>
        //     <div className="flex md:flex-col gap-4 justify-center items-center space-y-4">
        //       <div className="relative">
        //         <img
        //           src={
        //             typeof userProfile.profileimage === 'string'
        //               ? userProfile.profileimage
        //               : 'https://www.strasys.uk/wp-content/uploads/2022/02/Depositphotos_484354208_S.jpg'
        //           }
        //           alt="Profile"
        //           className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
        //         />
        //         <button
        //           onClick={() => fileInputRef.current?.click()}
        //           className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90"
        //         >
        //           <Pencil className="w-2 h-2 md:w-4 md:h-4" />
        //         </button>
        //         <input
        //           ref={fileInputRef}
        //           type="file"
        //           accept="image/*"
        //           name="profileimage"
        //           className="hidden"
        //           onChange={handleFileUpload}
        //         />
        //       </div>
        //       <p className="text-sm text-gray-500">
        //         Click the edit button to update your photo
        //       </p>
        //     </div>
        //   </div>

        //   {/* Personal Information Section */}
        //   <div className="bg-white dark:bg-boxdark rounded-lg shadow p-6 md:col-span-2">
        //     <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        //       <User className="w-5 h-5" />
        //       Personal Information
        //     </h2>
        //     <form onSubmit={updateUserProfile} className="space-y-4">
        //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        //         {/* Name */}
        //         <div className="space-y-2">
        //           <div className="flex items-center gap-4">
        //             <label className="text-sm font-medium">Full Name</label>
        //             <Edit
        //               onClick={() => handleEdit('name')}
        //               className="h-5 w-5 text-primary"
        //             />
        //           </div>
        //           <div className="relative">
        //             <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        //             <ClickOutside
        //               onClick={() =>
        //                 setDisabledFields((prev) => ({ ...prev, name: true }))
        //               }
        //             >
        //               <input
        //                 type="text"
        //                 name="name"
        //                 value={userProfile.name}
        //                 onChange={handleInputChange}
        //                 className={`pl-10 bg-white dark:bg-boxdark w-full rounded-md focus:border-primary px-3 py-2 outline-none
        //                 ${disabledFields.name ? '' : 'border border-gray-300'}`}
        //                 disabled={disabledFields.name}
        //                 placeholder="John Doe"
        //               />
        //             </ClickOutside>
        //           </div>
        //         </div>

        //         {/* Phone Number */}
        //         <div className="space-y-2">
        //           <div className="flex items-center gap-4">
        //             <label className="text-sm font-medium">Phone Number</label>
        //             <Edit
        //               onClick={() => handleEdit('phone')}
        //               className="h-5 w-5 text-primary"
        //             />
        //           </div>
        //           <div className="relative">
        //             <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        //             <ClickOutside
        //               onClick={() =>
        //                 setDisabledFields((prev) => ({ ...prev, phone: true }))
        //               }
        //             >
        //               <input
        //                 type="tel"
        //                 name="phone"
        //                 value={userProfile.phone}
        //                 onChange={handleInputChange}
        //                 className={`pl-10 bg-white dark:bg-boxdark w-full rounded-md focus:border-primary px-3 py-2 outline-none
        //                 ${
        //                   disabledFields.phone ? '' : 'border border-gray-300'
        //                 }`}
        //                 disabled={disabledFields.phone}
        //                 placeholder="+254712345678"
        //               />
        //             </ClickOutside>
        //           </div>
        //         </div>

        //         {/* Email Address */}
        //         <div className="space-y-2">
        //           <div className="flex items-center gap-4">
        //             <label className="text-sm font-medium">Email Address</label>
        //             {/* <Edit
        //               onClick={() => handleEdit('email')}
        //               className="h-5 w-5 text-primary"
        //             /> */}
        //             <div className='text-xs text-yellow-500 flex gap-1 items-center'>
        //               <Info className='h-3 w-3 text-yellow-500' />
        //               Email editing is disabled</div>
        //           </div>
        //           <div className="relative">
        //             <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        //             <ClickOutside
        //               onClick={() =>
        //                 setDisabledFields((prev) => ({ ...prev, email: true }))
        //               }
        //             >
        //               <input
        //                 type="email"
        //                 name="email"
        //                 value={userProfile.email}
        //                 onChange={() => void 0}
        //                 className={`pl-10 bg-white dark:bg-boxdark w-auto rounded-md focus:border-primary px-3 py-2 outline-none`}
        //                 disabled
        //                 placeholder="johndoe@example.com"
        //               />
        //             </ClickOutside>
        //           </div>
        //         </div>
        //       </div>

        //       <div className="flex justify-end gap-4 pt-4">
        //         {/* <button
        //           type="button"
        //           className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        //         >
        //           Cancel
        //         </button> */}
        //         <button
        //           type="submit"
        //           className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80
        //             ${submitting ? 'cursor-not-allowed opacity-40' : ''}`}
        //         >
        //           {submitting ? 'Updating...' : 'Save Changes'}
        //         </button>
        //       </div>
        //     </form>
        //   </div>
        // </div>
        <PersonalInformation userProfile={userProfile} refreshUserData={() => fetchUserData()} />
      )}

      {/* Security Tab Content */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Password Settings</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="bg-white dark:bg-boxdark w-full rounded-md border border-gray-300 focus:border-primary px-3 py-2 outline-none"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="bg-white dark:bg-boxdark w-full rounded-md border border-gray-300 focus:border-primary px-3 py-2 outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="bg-bodydark1 dark:bg-graydark border-l-4 border-blue-400 text-accent1 dark:border-primary/60 p-4 text-sm dark:text-primary/60">
              Password must be at least 8 characters long and contain at least
              one uppercase letter, one lowercase letter, and one number.
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Next of Kin Tab Content */}
      {activeTab === 'next-of-kin' && (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Next of Kin Information
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="nextofkinname"
                  value={userProfile.nextofkinname}
                  onChange={handleInputChange}
                  className="bg-white dark:bg-boxdark w-full rounded-md border border-gray-300 focus:border-primary px-3 py-2 outline-none"
                  placeholder="Next of kin's full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="nextofkinphonenumber"
                  value={userProfile.nextofkinphonenumber}
                  onChange={handleInputChange}
                  className="bg-white dark:bg-boxdark w-full rounded-md border border-gray-300 focus:border-primary px-3 py-2 outline-none"
                  placeholder="Next of kin's phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front ID Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Front ID</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    name="nextOfKinFrontId"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                    id="frontId"
                  />
                  <label htmlFor="frontId" className="cursor-pointer">
                    {frontIdPreview ? (
                      <img
                        src={frontIdPreview}
                        alt="Front ID Preview"
                        className="mx-auto rounded-lg max-h-40"
                      />
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Click to upload front ID
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Back ID Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Back ID</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    name="nextOfKinBackId"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                    id="backId"
                  />
                  <label htmlFor="backId" className="cursor-pointer">
                    {backIdPreview ? (
                      <img
                        src={backIdPreview}
                        alt="Back ID Preview"
                        className="mx-auto rounded-lg max-h-40"
                      />
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Click to upload back ID
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings2;
