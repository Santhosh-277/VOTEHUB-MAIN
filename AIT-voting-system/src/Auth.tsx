import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent, loginStudent, studentExists, getAllStudents, getStudentByRollNoAndEmail, updateStudentPassword } from '@/integrations/firebase/authService';
import emailjs from '@emailjs/browser';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Vote, Loader, ArrowLeft, Camera, ShieldCheck, UserCheck } from 'lucide-react';

declare global {
  interface Window {
    faceapi: any;
  }
}

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'identity' | 'otp' | 'reset'>('identity');
  const [recoveryRollNo, setRecoveryRollNo] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentIdToReset, setStudentIdToReset] = useState('');

  // Face Recognition State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceData, setFaceData] = useState<string | null>(null);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [captureStep, setCaptureStep] = useState<'details' | 'face'>('details');
  const [verificationStep, setVerificationStep] = useState<'credentials' | 'face'>('credentials');
  const [tempStudent, setTempStudent] = useState<any>(null);
  const [detectionTimer, setDetectionTimer] = useState<any>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([
          window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log('Face-api models loaded');
      } catch (error) {
        console.error('Error loading face-api models:', error);
      }
    };

    if (window.faceapi) {
      loadModels();
    } else {
      // Re-check after a short delay if script hasn't loaded yet
      const timer = setTimeout(() => {
        if (window.faceapi) loadModels();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Start detection loop for visual feedback
        const timer = setInterval(async () => {
          if (videoRef.current && canvasRef.current && modelsLoaded) {
            const displaySize = {
              width: videoRef.current.offsetWidth || 640,
              height: videoRef.current.offsetHeight || 480
            };
            window.faceapi.matchDimensions(canvasRef.current, displaySize);

            const detections = await window.faceapi.detectAllFaces(
              videoRef.current,
              new window.faceapi.SsdMobilenetv1Options()
            ).withFaceLandmarks();

            const resizedDetections = window.faceapi.resizeResults(detections, displaySize);
            const context = canvasRef.current.getContext('2d');
            if (context) {
              context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              window.faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
              window.faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            }
          }
        }, 200);
        setDetectionTimer(timer);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (detectionTimer) {
      clearInterval(detectionTimer);
      setDetectionTimer(null);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setIsCapturing(true);
    const detections = await window.faceapi.detectSingleFace(
      videoRef.current,
      new window.faceapi.SsdMobilenetv1Options()
    ).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      const descriptor = Array.from(detections.descriptor).join(',');
      setFaceData(descriptor);
      toast.success('Face captured successfully!');
      stopCamera();
      setCaptureStep('details');
    } else {
      toast.error('No face detected. Please try again.');
    }
    setIsCapturing(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const student = await loginStudent(rollNo, password);

      if (student) {
        if (student.faceData) {
          setTempStudent(student);
          setVerificationStep('face');
          startCamera();
        } else {
          toast.success('Signed in successfully');
          const sessionData = { id: student.id, rollNo: student.rollNo, name: student.name, role: 'student' };
          localStorage.setItem('studentSession', JSON.stringify(sessionData));
          window.dispatchEvent(new Event('studentSessionCreated'));
          setTimeout(() => navigate('/dashboard'), 100);
        }
      } else {
        toast.error('Invalid roll number or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during sign in');
    }

    setLoading(false);
  };

  const verifyFaceAndLogin = async () => {
    if (!videoRef.current || !tempStudent || !tempStudent.faceData) return;

    setVerifyingFace(true);
    const detections = await window.faceapi.detectSingleFace(
      videoRef.current,
      new window.faceapi.SsdMobilenetv1Options()
    ).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      const storedDescriptor = new Float32Array(tempStudent.faceData.split(',').map(Number));
      const distance = window.faceapi.euclideanDistance(detections.descriptor, storedDescriptor);

      console.log('Face Match Distance:', distance);

      if (distance < 0.45) { // Stricter threshold for matching
        toast.success('Face verified! Signing in...');
        stopCamera();
        const sessionData = { id: tempStudent.id, rollNo: tempStudent.rollNo, name: tempStudent.name, role: 'student' };
        localStorage.setItem('studentSession', JSON.stringify(sessionData));
        window.dispatchEvent(new Event('studentSessionCreated'));
        setTimeout(() => navigate('/dashboard'), 100);
      } else {
        toast.error('Face verification failed. Please try again.');
      }
    } else {
      toast.error('No face detected. Please ensure you are visible to the camera.');
    }
    setVerifyingFace(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo || !password || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!faceData) {
      toast.warning('Biometric authentication is required. Please capture your face.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const exists = await studentExists(rollNo);
      if (exists) {
        toast.error('Roll number already registered');
        setLoading(false);
        return;
      }

      // Check if face is already registered with another roll number
      const allStudents = await getAllStudents();
      const currentDescriptor = new Float32Array(faceData.split(',').map(Number));
      
      const duplicateStudent = allStudents.find(student => {
        if (!student.faceData) return false;
        const storedDescriptor = new Float32Array(student.faceData.split(',').map(Number));
        const distance = window.faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
        return distance < 0.45; // Using the same threshold as login verification
      });

      if (duplicateStudent) {
        toast.error('This face is already registered with another roll number');
        setLoading(false);
        return;
      }

      await registerStudent(rollNo, password, name, email, faceData);
      toast.success('Account created successfully! You can now sign in.');
      setRollNo('');
      setPassword('');
      setName('');
      setEmail('');
      setFaceData(null);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account');
    }

    setLoading(false);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const student = await getStudentByRollNoAndEmail(recoveryRollNo, recoveryEmail);
      if (!student) {
        toast.error('No student found with this roll number and email');
        setLoading(false);
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      setStudentIdToReset(student.id);

      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      console.log('EmailJS Config Check:', {
        hasServiceId: !!SERVICE_ID,
        hasTemplateId: !!TEMPLATE_ID,
        hasPublicKey: !!PUBLIC_KEY
      });

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || SERVICE_ID === "your_service_id_here") {
        console.log('OTP for recovery (Test Mode):', otp);
        toast.info(`Demonstration Mode: OTP is ${otp}. To receive real emails, please set your ACTUAL EmailJS keys in the .env file.`);
        setRecoveryStep('otp');
        setLoading(false);
        return;
      }

      const templateParams = {
        to_name: student.name,
        to_email: recoveryEmail,
        otp_code: otp,
      };

      try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('EmailJS Success:', response.status, response.text);
        toast.success(`OTP sent to ${recoveryEmail}`);
        setRecoveryStep('otp');
      } catch (err) {
        console.error('EmailJS Error:', err);
        toast.error("Failed to send email. Check your EmailJS account or browser console for details.");
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = () => {
    if (enteredOTP === generatedOTP) {
      setRecoveryStep('reset');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await updateStudentPassword(studentIdToReset, newPassword);
      toast.success('Password reset successfully! You can now sign in.');
      setShowForgotPassword(false);
      setRecoveryStep('identity');
      setRecoveryRollNo('');
      setRecoveryEmail('');
      setEnteredOTP('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <Vote className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">College Voting System</CardTitle>
          <CardDescription>Cast your vote securely and transparently</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              {verificationStep === 'credentials' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-rollno">Roll Number</Label>
                    <Input
                      id="signin-rollno"
                      type="text"
                      placeholder="e.g., 2024001"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      type="button" 
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <ShieldCheck className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="text-lg font-semibold">Face Verification</h3>
                    <p className="text-sm text-gray-500">Please look at the camera to verify your identity</p>
                  </div>

                  <div className="relative bg-black rounded-lg overflow-hidden h-64">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                    />
                    {verifyingFace && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        stopCamera();
                        setVerificationStep('credentials');
                      }}
                      disabled={verifyingFace}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={verifyFaceAndLogin}
                      disabled={verifyingFace || !modelsLoaded}
                    >
                      {verifyingFace ? 'Verifying...' : 'Verify Face'}
                    </Button>
                  </div>
                </div>
              )}
              
              {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <Card className="w-full max-w-sm">
                    <CardHeader>
                      <CardTitle>Reset Password</CardTitle>
                      <CardDescription>
                        {recoveryStep === 'identity' && "Enter your registered roll number and email"}
                        {recoveryStep === 'otp' && "Enter the 6-digit code sent to your email"}
                        {recoveryStep === 'reset' && "Enter your new password"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recoveryStep === 'identity' && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Roll Number</Label>
                            <Input 
                              required 
                              value={recoveryRollNo} 
                              onChange={(e) => setRecoveryRollNo(e.target.value)} 
                              placeholder="e.g. 2024001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input 
                              type="email" 
                              required 
                              value={recoveryEmail} 
                              onChange={(e) => setRecoveryEmail(e.target.value)} 
                              placeholder="your@email.com"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowForgotPassword(false)}>Cancel</Button>
                            <Button type="submit" className="flex-1" disabled={loading}>
                              {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Send OTP"}
                            </Button>
                          </div>
                        </form>
                      )}

                      {recoveryStep === 'otp' && (
                        <div className="space-y-4 flex flex-col items-center">
                          <InputOTP
                            maxLength={6}
                            value={enteredOTP}
                            onChange={(value) => setEnteredOTP(value)}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" className="flex-1" onClick={() => setRecoveryStep('identity')}>Back</Button>
                            <Button className="flex-1" onClick={handleVerifyOTP}>Verify OTP</Button>
                          </div>
                        </div>
                      )}

                      {recoveryStep === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input 
                              type="password" 
                              required 
                              value={newPassword} 
                              onChange={(e) => setNewPassword(e.target.value)} 
                              minLength={6}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input 
                              type="password" 
                              required 
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              minLength={6}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Reset Password"}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              {captureStep === 'details' ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-rollno">Roll Number</Label>
                    <Input
                      id="signup-rollno"
                      type="text"
                      placeholder="e.g., 2024001"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                  </div>

                  <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
                    {faceData ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <UserCheck className="w-5 h-5" />
                        <span className="font-semibold">Face data captured</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-8 px-2"
                          onClick={() => {
                            setFaceData(null);
                            setCaptureStep('face');
                            startCamera();
                          }}
                        >
                          Retake
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-sm font-medium">Biometric Setup Required</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCaptureStep('face');
                            startCamera();
                          }}
                        >
                          Capture Face
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !faceData}>
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <Camera className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="text-lg font-semibold">Face Capture</h3>
                    <p className="text-sm text-gray-500">Please center your face in the frame</p>
                  </div>

                  <div className="relative bg-black rounded-lg overflow-hidden h-64">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                    />
                    {isCapturing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        stopCamera();
                        setCaptureStep('details');
                      }}
                      disabled={isCapturing}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={captureFace}
                      disabled={isCapturing || !modelsLoaded}
                    >
                      {isCapturing ? 'Capturing...' : 'Capture'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
