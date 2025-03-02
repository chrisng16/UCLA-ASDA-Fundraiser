"use client";
import QRCodeSection from "@/components/qr-code-section";
import SonnerNotification from "@/components/sonner-notification";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addEntry } from "@/lib/actions";
import { formatPhoneNumber } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useForm, UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import HeaderImage from "../public/unknown.png";

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
    const [isPending, startTransition] = useTransition();
    const [isDisabled, setIsDisabled] = useState(false);

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
            setVenmoUrl(encodedVenmoUrl);
            setShowQR(true);
        }
    };

    useEffect(() => {
        const deadline = new Date("03/01/2025").getTime();
        const now = Date.now();
        if (now > deadline) {
            setIsDisabled(true);
        }
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <Suspense>
                <SonnerNotification setShowQR={setShowQR} />
            </Suspense>
            <Image src={HeaderImage} alt="Header" className="rounded-lg" />
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Order Dealine Passed
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Thank you for your interest! Unfortunately, the
                            deadline for this event pre-order has passed. We
                            appreciate your support and hope to see you next
                            time!
                        </DialogDescription>
                    </DialogHeader>
                    <span className="text-xl font-semibold">
                        Thank you for your interest! Unfortunately, the deadline
                        for this event pre-order has passed. We appreciate your
                        support and hope to see you next time!
                    </span>
                </DialogContent>
            </Dialog>
            <Form {...form}>
                <form
                    action={async (formData) => {
                        startTransition(async () => {
                            await addEntry(formData);
                        });
                    }}
                    className="space-y-6"
                >
                    {form.formState.isSubmitting}
                    <QRCodeSection
                        disabled={isPending || isDisabled}
                        showQR={showQR}
                        setShowQR={setShowQR}
                        url={venmoUrl}
                    />
                    <div className={`${showQR ? "hidden" : ""} space-y-6`}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Harry Potter"
                                            disabled={isDisabled}
                                        />
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
                                        <Input
                                            type="email"
                                            {...field}
                                            disabled={isDisabled}
                                            placeholder="harry.potter@hogwarts.edu"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A confirmation email will be sent to
                                        this email. Please use an active email!
                                    </FormDescription>
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
                                            disabled={isDisabled}
                                            onChange={(e) =>
                                                handlePhoneChange(
                                                    e,
                                                    form.setValue
                                                )
                                            } // Handle the phone number input change
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
                                                {item.replace(
                                                    /([A-Z])/g,
                                                    " $1"
                                                )}{" "}
                                                ($
                                                {
                                                    PRICES[
                                                        item as keyof typeof PRICES
                                                    ]
                                                }
                                                )
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    disabled={isDisabled}
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
                                disabled={
                                    total === 0 ||
                                    !form.formState.isValid ||
                                    isDisabled
                                }
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
