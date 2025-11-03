"use client";

import { useForm } from "react-hook-form";
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
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5, "Please select a rating"),
  features: z
    .array(z.string())
    .min(1, "Please select at least one feature")
    .max(2, "You can select a maximum of 2 features"),
  feedback: z
    .string()
    .max(1500, "Feedback must be less than 1500 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const FEATURES = [
  {
    id: "itinerary",
    label: "Itinerary Planner",
    description:
      "Plan your perfect day with our intelligent itinerary planner. Get personalized recommendations for activities, restaurants, and attractions based on your preferences, location, and schedule. The planner optimizes routes and timing to make the most of your day.",
  },
  {
    id: "friends",
    label: "Add Friends",
    description:
      "Connect with friends and share your experiences together. Notify them if you are unsure about the safety and if you don't reach your destination within a set amount of time , they get a message and your last location",
  },
  {
    id: "assistant",
    label: "Hyper-Personalized Assistant",
    description:
      "Get answers tailored specifically to you. Our AI assistant learns your preferences, travel style, dietary restrictions, and interests to provide highly personalized recommendations. Ask anything and receive context-aware suggestions that match your unique needs.",
  },
];

const Page = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      features: [],
      feedback: "",
    },
  });

  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      toast.success("Thank you for submitting your feedback!", {
        description: "We appreciate your input and will review it soon.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Share Your Feedback
            </h1>
            <p className="text-gray-600">
              Help us improve by sharing your thoughts and suggestions
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Rating Field */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      How would you rate your experience?
                    </FormLabel>
                    <FormDescription>
                      Select a rating from 1 (poor) to 5 (excellent)
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                        className="flex gap-4 justify-center py-4"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex flex-col items-center">
                            <RadioGroupItem
                              value={rating.toString()}
                              id={`rating-${rating}`}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={`rating-${rating}`}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`h-10 w-10 transition-all ${
                                  field.value >= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-200"
                                }`}
                              />
                            </label>
                            <span className="text-sm text-gray-600 mt-1">
                              {rating}
                            </span>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Features Selection */}
              <FormField
                control={form.control}
                name="features"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Which features interest you most?
                    </FormLabel>
                    <FormDescription>
                      Select 1-2 features you'd like to see or try
                    </FormDescription>
                    <div className="space-y-4 mt-4">
                      {FEATURES.map((feature) => (
                        <div key={feature.id} className="space-y-2">
                          <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        if (currentValues.length < 2) {
                                          field.onChange([...currentValues, feature.id]);
                                        } else {
                                          toast.error("Maximum 2 features allowed");
                                        }
                                      } else {
                                        field.onChange(
                                          currentValues.filter((value) => value !== feature.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {feature.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <Accordion type="single" collapsible className="ml-7">
                            <AccordionItem value={feature.id} className="border-none">
                              <AccordionTrigger className="text-sm text-blue-600 hover:text-blue-800 py-2 ml-2">
                                Learn more
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-gray-600">
                                {feature.description}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feedback Field */}
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Your Feedback
                    </FormLabel>
                    <FormDescription>
                      Tell us what you think. What do you like? What can we
                      improve?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts here..."
                        className="min-h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-sm text-gray-500">
                        {field.value.length}/1500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-12"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Page;