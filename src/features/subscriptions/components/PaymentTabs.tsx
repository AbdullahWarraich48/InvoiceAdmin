import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dispatch, SetStateAction } from "react";

interface CardForm {
  holderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  country: string;
  billingAddress: string;
}

interface Props {
  paymentMethod: string;
  onMethodChange: (method: string) => void;
  cardForm: CardForm;
  setCardForm: Dispatch<SetStateAction<CardForm>>;
}

export function PaymentTabs({ paymentMethod, onMethodChange, cardForm, setCardForm }: Props) {
  return (
    <Tabs value={paymentMethod} onValueChange={onMethodChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="card">Card</TabsTrigger>
        <TabsTrigger value="paypal">PayPal</TabsTrigger>
        <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
      </TabsList>
      <TabsContent value="card" className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name on card</Label>
            <Input value={cardForm.holderName} onChange={(e) => setCardForm((s) => ({ ...s, holderName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Card number</Label>
            <Input placeholder="4242 4242 4242 4242" value={cardForm.cardNumber} onChange={(e) => setCardForm((s) => ({ ...s, cardNumber: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Expiry</Label>
            <Input placeholder="MM/YY" value={cardForm.expiry} onChange={(e) => setCardForm((s) => ({ ...s, expiry: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>CVV</Label>
            <Input placeholder="123" value={cardForm.cvv} onChange={(e) => setCardForm((s) => ({ ...s, cvv: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={cardForm.country} onChange={(e) => setCardForm((s) => ({ ...s, country: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Billing address</Label>
            <Input value={cardForm.billingAddress} onChange={(e) => setCardForm((s) => ({ ...s, billingAddress: e.target.value }))} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="paypal" className="text-sm text-muted-foreground">After continue, you will be redirected to PayPal.</TabsContent>
      <TabsContent value="bank" className="text-sm text-muted-foreground">Bank transfer details will appear after order confirmation.</TabsContent>
    </Tabs>
  );
}

export type { CardForm };

