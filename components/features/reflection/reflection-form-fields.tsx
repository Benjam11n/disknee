"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ReflectionFormData } from "@/lib/validations/reflection-validations";
import { UseFormReturn } from "react-hook-form";
import { getFatigueLabel } from "@/lib/utils/session-utils";

interface ReflectionFormFieldsProps {
  form: UseFormReturn<ReflectionFormData>;
}

export function ReflectionFormFields({ form }: ReflectionFormFieldsProps) {
  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Rating Field */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                How would you rate this session?
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>Poor (1)</span>
                    <span>Excellent (5)</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fatigue Level Field */}
        <FormField
          control={form.control}
          name="fatigue"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                How fatigued are you after the session?
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  />
                  <div className="flex justify-center items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span>
                      Current level: {getFatigueLabel(field.value[0])}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>🟢 Very Low</span>
                    <span>🟡 Moderate</span>
                    <span>🔴 Very High</span>
                  </div>
                </div>
              </FormControl>
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
              <FormLabel className="text-base font-medium">
                Any additional feedback? (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience, any discomfort, or suggestions for improvement..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
