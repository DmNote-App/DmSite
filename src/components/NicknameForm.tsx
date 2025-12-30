"use client";

import { useEffect, useState } from "react";
import { Search, AlertCircle } from "lucide-react";

type NicknameFormProps = {
  defaultNickname: string;
  onSubmit: (nickname: string) => void;
  buttonLabel?: string;
  helperText?: string;
  errorMessage?: string;
};

export default function NicknameForm({
  defaultNickname,
  onSubmit,
  buttonLabel = "조회하기",
  helperText,
  errorMessage
}: NicknameFormProps) {
  const [value, setValue] = useState(defaultNickname);

  useEffect(() => {
    setValue(defaultNickname);
  }, [defaultNickname]);

  return (
    <form
      className="w-full flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (trimmed.length === 0) return;
        onSubmit(trimmed);
      }}
    >
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-grey-400 group-focus-within:text-brand transition-colors">
          <Search size={20} />
        </div>
        <input
          className={`w-full rounded-2xl border bg-surface px-6 py-3.5 pl-12 text-lg font-semibold text-grey-900 transition-colors placeholder:text-grey-400 focus:outline-none focus:ring-1 ${errorMessage
            ? "border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-400"
            : "border-grey-200 focus:border-brand focus:ring-brand"
            }`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="닉네임 입력"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mt-1">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={value.trim().length === 0}
        className="ui-btn w-full mt-2 py-3.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>

      {helperText && (
        <p className="text-xs text-grey-500 mt-2 text-center">
          {helperText}
        </p>
      )}
    </form>
  );
}
