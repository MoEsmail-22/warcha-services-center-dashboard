import Input from './Input';

/**
 * Input adapter for react-hook-form fields.
 */
export default function FormHookInput({ register, name, rules, error, ...props }) {
  return <Input {...props} {...register(name, rules)} error={error} />;
}
