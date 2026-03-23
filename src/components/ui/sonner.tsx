import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      duration={3000}
      toastOptions={{
        style: {
          background: "#0F172A",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: "12px 20px",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 13,
          fontWeight: 400,
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
