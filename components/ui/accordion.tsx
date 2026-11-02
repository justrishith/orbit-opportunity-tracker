"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

const Accordion = AccordionPrimitive.Root;
const AccordionItem = forwardRef<ElementRef<typeof AccordionPrimitive.Item>, ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className = "", ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={`landing-accordion-item ${className}`} {...props} />);
AccordionItem.displayName = AccordionPrimitive.Item.displayName;
const AccordionTrigger = forwardRef<ElementRef<typeof AccordionPrimitive.Trigger>, ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className = "", children, ...props }, ref) => <AccordionPrimitive.Header className="landing-accordion-header"><AccordionPrimitive.Trigger ref={ref} className={`landing-accordion-trigger ${className}`} {...props}>{children}<ChevronDown className="accordion-chevron" size={16} /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = forwardRef<ElementRef<typeof AccordionPrimitive.Content>, ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className = "", children, ...props }, ref) => <AccordionPrimitive.Content ref={ref} className={`landing-accordion-content ${className}`} {...props}><div className="landing-accordion-inner">{children}</div></AccordionPrimitive.Content>);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
