import { useState } from "react";
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

const Cred = () => {
  const [username, setUserName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignin, setisSignin] = useState<boolean>(true);

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [signup, { isLoading: signupLoading }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAuthChange = () => {
    setisSignin(!isSignin);
    setName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const credentials = isSignin
      ? { userName: username, password }
      : { userName: username, password, name };

    try {
      const data = isSignin
        ? await login(credentials).unwrap()
        : await signup(credentials).unwrap();

      if (data.success) {
        dispatch(setUser(data.user));
        navigate("/chat");
      }
    } catch (error) {
      console.error("Authentication error:", error);
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
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    placeholder="username"
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <CardFooter className="flex justify-between pt-4">
                <Button
                  variant="default"
                  size={"max"}
                  type="submit"
                  disabled={isSignin ? loginLoading : signupLoading}
                >
                  {isSignin ? "Signin" : "Signup"}
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
                  size={"link"}
                  type="button"
                  onClick={handleAuthChange}
                >
                  Signup
                </Button>
              </>
            ) : (
              <>
                Already have an account?
                <Button
                  variant="link"
                  size={"link"}
                  type="button"
                  onClick={handleAuthChange}
                >
                  Signin
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
