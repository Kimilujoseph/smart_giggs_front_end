import {
  Clock,
  EyeClosed,
  EyeIcon,
  EyeOff,
  Upload,
  Verified,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '@/types/decodedToken';
import axios from 'axios';
import Message from '../alerts/Message';

interface AccountSettingsProps {
  refreshUserData: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  refreshUserData,
}) => {
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [uploadingDocuments, setUploadingDocuments] = useState<boolean>(false);
  const [frontId, setFrontId] = useState<File | null>(null);
  const [backId, setBackId] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const token = localStorage.getItem('tk');
  const currentUser: DecodedToken = jwt_decode(token!);
  const [frontIdPreview, setFrontIdPreview] = useState<
    string | ArrayBuffer | null
  >(null);
  const [backIdPreview, setBackIdPreview] = useState<
    string | ArrayBuffer | null
  >(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (e.target.name === 'nextOfKinFrontId') {
      setFrontId(file);
    } else if (e.target.name === 'nextOfKinBackId') {
      setBackId(file);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (e.target.name === 'nextOfKinFrontId') {
        setFrontIdPreview(reader.result);
      } else if (e.target.name === 'nextOfKinBackId') {
        setBackIdPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one number');
    }
    // Send a request to update the password
    try {
      e.currentTarget.reset();
      setUpdatingPassword(true);
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/user/update/profile`,
        { password },
        { withCredentials: true },
      );
      console.log(response.data);
      setMessage({
        text:
          response.data.message ||
          'An error occurred while updating your password',
        type: 'success',
      });
    } catch (error: any) {
      console.error(error);
      setMessage({
        text:
          error.response.data.message ||
          error.response.message ||
          'An error occurred while updating your password',
        type: `${
          error.response.status >= 400 && error.response.status < 500
            ? 'warning'
            : 'error'
        }`,
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleUploadDocuments = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const frontImage = new FormData();
    frontImage.append('images', frontId as File);
    const backImage = new FormData();
    backImage.append('images', backId as File);

    console.log(frontId, backId);

    // Send a request to upload the documents
    try {
      e.currentTarget.reset();
      setUploadingDocuments(true);
      const frontIdResponse = await axios.put(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/user/update/identificationfront`,
        frontImage,
        { withCredentials: true },
      );
      const backIdResponse = await axios.put(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/user/update/identificationbackward`,
        backImage,
        { withCredentials: true },
      );
      console.log(frontIdResponse.data, backIdResponse.data);
      setMessage({
        text:
          frontIdResponse.data.message ||
          backIdResponse.data.message ||
          'An error occurred while uploading your documents',
        type: 'success',
      });
    } catch (error: any) {
      console.error(error);
      setMessage({
        text:
          error.response.data.message ||
          error.response.message ||
          'An error occurred while uploading your documents',
        type: `${
          error.response.status >= 400 && error.response.status < 500
            ? 'warning'
            : 'error'
        }`,
      });
    } finally {
      setUploadingDocuments(false);
      refreshUserData();
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      {/* Password Settings */}
      <section className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Password Settings</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  onChange={() => setPasswordError(null)}
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`bg-white dark:bg-boxdark w-full rounded-md border ${
                    passwordError ? 'border-red-400' : 'border-gray-300'
                  } focus:border-primary px-3 py-2 outline-none`}
                  placeholder="Enter new password"
                />

                <div className="flex items-center absolute right-3 top-1/2 transform -translate-y-1/2">
                  {showPassword ? (
                    <EyeOff
                      className="h-6 w-6 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <EyeIcon
                      className="h-6 w-6 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                onChange={() => setPasswordError(null)}
                required
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`bg-white dark:bg-boxdark w-full rounded-md border ${
                  passwordError ? 'border-red-400' : 'border-gray-300'
                } focus:border-primary px-3 py-2 outline-none`}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="bg-bodydark1 dark:bg-graydark border-l-4 border-blue-400 text-accent1 dark:border-primary/60 p-4 text-sm dark:text-primary/60">
            Password must be at least 8 characters long and contain at least one
            uppercase letter, one lowercase letter, and one number.
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

      {/* Identity Documents */}
      {currentUser && currentUser.workingstatus === 'inactive' ? (
        <section className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold">Identity Documents</h2>
          <div className="flex gap-2 items-center p-2">
            <XCircle className="h-6 w-6 text-red-400" />
            <p className="text-sm text-slate-400">
              Your identity documents have not been verified. Please upload your
              front and back National ID.
            </p>
          </div>

          <form onSubmit={handleUploadDocuments} className="space-y-4">
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
                        src={
                          typeof frontIdPreview === 'string'
                            ? frontIdPreview
                            : undefined
                        }
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
                        src={
                          typeof backIdPreview === 'string'
                            ? backIdPreview
                            : undefined
                        }
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

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
              >
                {uploadingDocuments ? 'Uploading...' : 'Upload Documents'}
              </button>
            </div>
          </form>
        </section>
      ) : currentUser && currentUser.workingstatus === 'active' ? (
        <section className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Identity Documents</h2>
          <div className="flex gap-2 items-center">
            <Verified className="h-6 w-6 text-primary" />
            <p className="text-sm text-slate-400">
              Your identity documents have been verified.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-boxdark rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Identity Documents</h2>
          <div className="flex gap-2 items-center">
            <Clock className="h-6 w-6 text-yellow-500" />
            <p className="text-sm text-slate-400">
              Your identity documents are currently being reviewed.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default AccountSettings;
