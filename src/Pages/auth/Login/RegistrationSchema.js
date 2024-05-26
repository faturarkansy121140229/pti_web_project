import { faSkyatlas } from "@fortawesome/free-brands-svg-icons";
import { faLandMineOn } from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";

export const registrationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().min(6).required("Please enter your password"),
});
