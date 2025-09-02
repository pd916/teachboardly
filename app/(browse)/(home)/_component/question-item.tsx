import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface QuestionItemProps {
    label: string;
    desc: string;
}

const QuestionItem = ({
    label,
    desc
}: QuestionItemProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
         <AccordionItem value="item-1">
            <AccordionTrigger>{label}</AccordionTrigger>
            <AccordionContent>
            <p>{desc}</p>
            </AccordionContent>
         </AccordionItem>
    </Accordion>
  )
}

export default QuestionItem
