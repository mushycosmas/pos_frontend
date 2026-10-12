
import React from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("pos_language", language);
  };

  return (
    <Form.Select
      size="sm"
      value={(i18n.resolvedLanguage || i18n.language).split("-")[0]}
      onChange={(event) => changeLanguage(event.target.value)}
      aria-label="Select language"
      style={{ width: "150px" }}
    >
      <option value="en">🇬🇧 English</option>
      <option value="sw">🇹🇿 Kiswahili</option>
    </Form.Select>
  );
};

export default LanguageSwitcher;
