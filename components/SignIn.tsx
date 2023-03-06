import { useUser } from "@supabase/auth-helpers-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useAnalytics } from "~/components/context/analytics";
import { useSignInModal } from "~/components/sign-in-modal";
import UserDropdown from "~/components/user-dropdown";
import { FADE_IN_ANIMATION_SETTINGS } from "~/utils/constants";

export default function SignIn() {
  const user = useUser();
  const { analytics } = useAnalytics();
  const { SignInModal, setShowSignInModal } = useSignInModal();

  if (user) {
    analytics.identify(user.id, {
      email: user.email,
    });
  }

  function handleSignIn() {
    setShowSignInModal(true);
    analytics.track("SignInButton Clicked");
  }

  /*useEffect(() => {
      async function loadData() {
        const { data } = await supabaseClient.from('test').select('*')
        setData(data)
      }
      // Only run query once user is logged in.
      if (user) loadData()
    }, [user])*/
  return (
    <div>
      <SignInModal />

      <AnimatePresence>
        {user ? (
          <UserDropdown />
        ) : (
          <motion.button
            className="rounded-full border border-black bg-black p-1.5 px-1 text-sm text-white transition-all hover:bg-white hover:text-black md:px-4"
            onClick={handleSignIn}
            {...FADE_IN_ANIMATION_SETTINGS}
          >
            登录
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
