import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import React, { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";

const QRCodeSection = ({
  showQR,
  setShowQR,
  url,
  disabled,
}: {
  showQR: boolean;
  setShowQR: Dispatch<SetStateAction<boolean>>;
  url: string;
  disabled: boolean;
}) => {
  console.log(disabled);
  return (
    <Card id="payment" className={`${showQR ? "flex flex-col" : "hidden"}`}>
      <CardHeader>
        <div className="grid grid-cols-5 items-center">
          <Button
            onClick={() => setShowQR(false)}
            type="button"
            variant="secondary"
            size="sm"
            className="px-4 flex items-center justify-start w-fit"
          >
            <ChevronLeft />
            <span className="hidden sm:block">Go Back</span>
          </Button>
          <CardTitle className="text-center col-span-3">
            Payment Methods
          </CardTitle>
        </div>
        <CardDescription className="sm:px-6 text-center text-balance mt-1.5">
          Please complete your payment of choice and click on the Payment
          Completed below. We will verify your payment and send you a
          confirmation email within 2-3 business days.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="grid sm:grid-cols-9 w-full gap-4">
          <div className="flex flex-col items-center justify-center gap-2 sm:col-span-4">
            <h3 className="font-semibold text-balance text-xl text-center">
              Scan or Click to Pay with Venmo
            </h3>
            <Link href={url}>
              <QRCodeSVG value={url} />
            </Link>
            <span className="font-semibold">@Jun-Yaung</span>
          </div>

          <span className="text-center flex justify-center items-center text-xl w-full">
            or
          </span>

          <div className="sm:col-span-4 flex flex-col justify-center text-center text-balance font-semibold text-xl">
            <h3>Zelle with the Following Information</h3>
            <span className="font-normal">Name: Jun Yaung</span>
            <span className="font-normal">(818) 661-0309</span>
          </div>
        </div>
        <div className="space-x-4 flex w-full justify-center">
          <Button type="submit" disabled={disabled} className="w-full sm:w-3/4">
            {disabled ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Payment Completed"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeSection;
