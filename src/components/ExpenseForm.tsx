
import { Button } from "./ui/button";
import { TitleRow } from "./expense/TitleRow";
import { AmountCurrencyRow } from "./expense/AmountCurrencyRow";
import { AdditionalDetailsSection } from "./expense/AdditionalDetailsSection";
import { useExpenseForm } from "./expense/hooks/useExpenseForm";
import { Expense } from "../types";
interface ExpenseFormProps {
  groupId?: string;
  onSuccess: () => void;
  expenseToEdit?: Expense;
}

export function ExpenseForm({ 
  groupId, 
  onSuccess,
  expenseToEdit
}: ExpenseFormProps) {
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
