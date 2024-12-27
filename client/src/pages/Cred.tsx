import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation, useSignupMutation } from "@/store/api/authApi";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/hooks";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

const Cred = () => {
  const [username, setUserName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignin, setIsSignin] = useState<boolean>(true);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [signup, { isLoading: signupLoading }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAuthChange = () => {
    setIsSignin(!isSignin);
    setName("");
    setProfilePic(null);
    setProfilePicPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const credentials = isSignin
      ? { userName: username, password }
      : { userName: username, password, name };

    try {
      if (!isSignin && profilePic) {
        const formData = new FormData();
        formData.append("profilePic", profilePic);
        Object.entries(credentials).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const data = await signup(formData).unwrap();
        if (data.success) {
          dispatch(setUser(data.user));
          toast.success("Signup successful!");
          navigate("/chat");
        }
      } else {
        const data = isSignin
          ? await login(credentials).unwrap()
          : await signup(credentials).unwrap();

        if (data.success) {
          dispatch(setUser(data.user));
          toast.success(isSignin ? "Login successful!" : "Signup successful!");
          navigate("/chat");
        }
      }
    } catch (error: any) {
      toast.error(
        error.data?.message || "Authentication failed. Please try again.",
      );
    }
  };

  return (
    <div className="flex h-[100vh] w-[100vw] items-center justify-center">
      <div className="flex w-full items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {isSignin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignin ? "Sign into your account." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                {!isSignin && (
                  <>
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={profilePicPreview || undefined}
                            alt="Profile picture preview"
                          />
                          <AvatarFallback>
                            {name ? name[0].toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-0 right-0 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        type="file"
                        id="profilePic"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="Name"
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    placeholder="Username"
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <CardFooter className="flex justify-between pt-4">
                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  className="w-full"
                  disabled={isSignin ? loginLoading : signupLoading}
                >
                  {isSignin ? "Sign In" : "Sign Up"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
          <CardDescription className="pb-6 text-center">
            {isSignin ? (
              <>
                Don't have an account?
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  onClick={handleAuthChange}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                Already have an account?
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  onClick={handleAuthChange}
                >
                  Sign In
                </Button>
              </>
            )}
          </CardDescription>
        </Card>
      </div>
    </div>
  );
};

export default Cred;
