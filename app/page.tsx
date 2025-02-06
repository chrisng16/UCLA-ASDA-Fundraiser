"use client";
import { Suspense, useEffect, useState } from "react";
import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addEntry } from "@/lib/actions";
import { formatPhoneNumber } from "@/lib/utils";
import Image from "next/image";
import HeaderImage from "../public/unknown.png";
import SonnerNotification from "@/components/sonner-notification";
import QRCodeSection from "@/components/qr-code-section";

const PRICES = {
  cheeseRoll: 4.0,
  potatoBall: 4.0,
  chickenEmpanada: 4.0,
  guavaStrudel: 4.0,
};
type FormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  cheeseRoll: z.number().min(0, "Must be 0 or more"),
  potatoBall: z.number().min(0, "Must be 0 or more"),
  chickenEmpanada: z.number().min(0, "Must be 0 or more"),
  guavaStrudel: z.number().min(0, "Must be 0 or more"),
});

export default function OrderForm() {
  const [total, setTotal] = useState(0);
  const [venmoUrl, setVenmoUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cheeseRoll: 0,
      potatoBall: 0,
      chickenEmpanada: 0,
      guavaStrudel: 0,
    },
    mode: "onBlur",
  });

  const watchValues = form.watch();

  useEffect(() => {
    const calculateTotal = () => {
      return (
        watchValues.cheeseRoll * PRICES.cheeseRoll +
        watchValues.potatoBall * PRICES.potatoBall +
        watchValues.chickenEmpanada * PRICES.chickenEmpanada +
        watchValues.guavaStrudel * PRICES.guavaStrudel
      );
    };
    setTotal(calculateTotal());
  }, [watchValues]);

  const generateVenmoLink = (
    total: number,
    name: string,
    email: string,
    phone: string
  ) => {
    const venmoUsername = "Jun-Yaung";
    const note = `2025 ASDA Fundraiser: Order for ${name}, email: ${email}, phone: ${phone}`;
    const encodedNote = encodeURIComponent(note);
    return `https://venmo.com/${venmoUsername}?amount=${total}&note=${encodedNote}`;
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: UseFormSetValue<FormValues>
  ) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setValue("phone", formattedPhone);
  };

  const onContinueClicked = (
    clientName: string,
    clientEmail: string,
    phone: string
  ) => {
    if (total > 0) {
      const encodedVenmoUrl = generateVenmoLink(
        total,
        clientName,
        clientEmail,
        phone
      );
      console.log(encodedVenmoUrl);
      setVenmoUrl(encodedVenmoUrl);
      setShowQR(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Suspense>
        <SonnerNotification setShowQR={setShowQR} />
      </Suspense>
      <Image src={HeaderImage} alt="Header" className="rounded-lg" />
      <Form {...form}>
        <form action={addEntry} className="space-y-6">
          <QRCodeSection showQR={showQR} setShowQR={setShowQR} url={venmoUrl} />
          <div className={`${showQR ? "hidden" : ""} space-y-6`}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="xxx-xxx-xxxx"
                      maxLength={12}
                      value={field.value}
                      onChange={(e) => handlePhoneChange(e, form.setValue)} // Handle the phone number input change
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {Object.keys(PRICES).map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name={item as keyof typeof PRICES}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {item.replace(/([A-Z])/g, " $1")} ($
                        {PRICES[item as keyof typeof PRICES]})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">
                Total: ${total.toFixed(2)}
              </div>

              <Button
                type="button"
                onClick={() =>
                  onContinueClicked(
                    form.getValues("name"),
                    form.getValues("email"),
                    form.getValues("phone")
                  )
                }
                disabled={total === 0 || !form.formState.isValid}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
