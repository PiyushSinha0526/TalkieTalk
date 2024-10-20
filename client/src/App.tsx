import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useGetProfileQuery } from "./store/api/authApi";
import { clearUser, setUser } from "./store/slices/authSlice";
import { SocketProvider } from "./Socket";
import { Toaster } from "react-hot-toast";

const Cred = lazy(() => import("./pages/Cred"));
const Chat = lazy(() => import("./pages/Chat"));

function PrivateRoute({
  children,
  user,
}: {
  children: JSX.Element;
  user: boolean;
}) {
  return user ? children : <Navigate to="/" />;
}

function App() {
  const dispatch = useAppDispatch();
  const { data: profileData, isSuccess, isError } = useGetProfileQuery("");
  const { userAuth, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess && profileData) {
      dispatch(setUser(profileData.user));
    } else if (isError) {
      dispatch(clearUser());
    }
  }, [isSuccess, profileData, dispatch, isError]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-screen w-screen">
      <SocketProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route
                path="/"
                element={userAuth ? <Navigate to="/chat" /> : <Cred />}
              />
              <Route
                path="/chat"
                element={
                  <PrivateRoute user={!!userAuth}>
                    <Chat />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="bottom-center" />
      </SocketProvider>
    </div>
  );
}

export default App;
