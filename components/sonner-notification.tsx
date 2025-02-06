import { useSearchParams } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";

const SonnerNotification = ({
  setShowQR,
}: {
  setShowQR: Dispatch<SetStateAction<boolean>>;
}) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const successMessage = searchParams.get("success");
    const errorMessage = searchParams.get("error");
    console.log(successMessage);
    console.log(errorMessage);
    if (successMessage) {
      toast.success("Thank you! We received your order.", {
        description: successMessage,
        duration: 10000,
      });
    }
    if (errorMessage) {
      toast.error("Uh oh... Something went wrong!", {
        description: errorMessage,
        duration: 10000,
      });
    }
    setShowQR(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <></>;
};

export default SonnerNotification;
