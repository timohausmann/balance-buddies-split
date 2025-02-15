
import { Button } from "./ui/button";
import { FormValues, GroupMember } from "./expense/types";
import { TitleRow } from "./expense/TitleRow";
import { AmountCurrencyRow } from "./expense/AmountCurrencyRow";
import { AdditionalDetailsSection } from "./expense/AdditionalDetailsSection";
import { useExpenseForm } from "./expense/hooks/useExpenseForm";

interface CreateExpenseFormProps {
  groupId?: string;
  groupMembers: GroupMember[];
  defaultCurrency: string;
  onSuccess: () => void;
  expenseToEdit?: {
    id: string;
    title: string;
    amount: number;
    currency: string;
    spread_type: string;
    description?: string;
    paid_by_user_id: string;
    group_id: string;
    expense_date: string;
    expense_participants: Array<{
      user_id: string;
      share_percentage?: number;
      share_amount?: number;
    }>;
  };
}

export function CreateExpenseForm({ 
  groupId, 
  groupMembers, 
  defaultCurrency, 
  onSuccess,
  expenseToEdit
}: CreateExpenseFormProps) {
  const {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    isPending,
    selectedGroup,
    groupOptions,
    onSubmit
  } = useExpenseForm({
    groupId,
    defaultCurrency,
    onSuccess,
    expenseToEdit
  });

  const amount = parseFloat(watch("amount") || "0");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <TitleRow 
          register={register}
          errors={errors}
        />

        <AmountCurrencyRow 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />

        <AdditionalDetailsSection 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          groupMembers={selectedGroup?.group_members || []}
          groupOptions={groupOptions}
          defaultOpenGroup={!groupId && !expenseToEdit}
          amount={amount}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (expenseToEdit ? "Saving..." : "Creating...") : (expenseToEdit ? "Save Changes" : "Create Expense")}
      </Button>
    </form>
  );
}
