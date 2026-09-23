import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  type FamilyInvitation,
  type FamilyMembership,
  getFamilyInvitationErrorMessage,
} from "@/src/features/family/model/family-invitation";
import {
  acceptFamilyQrInvitation,
  createFamilyQrInvitation,
  getCurrentFamilyMembership,
} from "@/src/features/family/repository/family-invitations-remote-repository";

export function useFamilyInvitationsViewModel() {
  const session = useAuthStore((state) => state.session);
  const isMounted = useRef(true);
  const createRequest = useRef<Promise<FamilyInvitation | null> | null>(null);
  const acceptRequest = useRef<Promise<boolean> | null>(null);
  const [creating, setCreating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [membership, setMembership] = useState<FamilyMembership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reloadMembership = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) {
      if (isMounted.current) {
        setMembership(null);
        setMembershipLoading(false);
      }
      return;
    }

    if (isMounted.current) setMembershipLoading(true);

    try {
      const nextMembership = await getCurrentFamilyMembership(userId);
      if (isMounted.current) setMembership(nextMembership);
    } catch (nextError) {
      if (isMounted.current) setError(getFamilyInvitationErrorMessage(nextError));
    } finally {
      if (isMounted.current) setMembershipLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    void reloadMembership();
  }, [reloadMembership]);

  const createInvitation = useCallback(async () => {
    if (createRequest.current) return createRequest.current;

    const request = (async () => {
      if (isMounted.current) {
        setCreating(true);
        setError(null);
      }

      try {
        return await createFamilyQrInvitation();
      } catch (nextError) {
        if (isMounted.current) setError(getFamilyInvitationErrorMessage(nextError));
        return null;
      } finally {
        createRequest.current = null;
        if (isMounted.current) setCreating(false);
      }
    })();

    createRequest.current = request;
    return request;
  }, []);

  const acceptInvitation = useCallback(
    async (token: string) => {
      if (acceptRequest.current) return acceptRequest.current;

      const request = (async () => {
        if (isMounted.current) {
          setAccepting(true);
          setAccepted(false);
          setError(null);
        }

        try {
          await acceptFamilyQrInvitation(token);
          await reloadMembership();
          if (isMounted.current) setAccepted(true);
          return true;
        } catch (nextError) {
          if (isMounted.current) setError(getFamilyInvitationErrorMessage(nextError));
          return false;
        } finally {
          acceptRequest.current = null;
          if (isMounted.current) setAccepting(false);
        }
      })();

      acceptRequest.current = request;
      return request;
    },
    [reloadMembership],
  );

  const clearFeedback = useCallback(() => {
    if (!isMounted.current) return;
    setError(null);
    setAccepted(false);
  }, []);

  return useMemo(
    () => ({
      accepted,
      accepting,
      clearFeedback,
      createInvitation,
      creating,
      error,
      membership,
      membershipLoading,
      acceptInvitation,
      reloadMembership,
    }),
    [
      accepted,
      accepting,
      acceptInvitation,
      clearFeedback,
      createInvitation,
      creating,
      error,
      membership,
      membershipLoading,
      reloadMembership,
    ],
  );
}
