import { describe, it, expect } from "vitest";

type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

interface OrderSimulation {
  id: string;
  status: OrderStatus;
  stockRestored: boolean;
}

function transitionOrderStatus(
  order: OrderSimulation,
  nextStatus: OrderStatus
): { success: boolean; order: OrderSimulation; error?: string } {
  if (order.status === nextStatus) {
    return { success: true, order };
  }

  if (order.status === "Cancelled" || order.status === "Delivered") {
    return {
      success: false,
      order,
      error: `Terminal status lock: Cannot transition order from '${order.status}' to '${nextStatus}'.`,
    };
  }

  const allowed = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      success: false,
      order,
      error: `Invalid transition: Order in '${order.status}' cannot move directly to '${nextStatus}'. Allowed: [${allowed.join(", ")}].`,
    };
  }

  const updatedOrder: OrderSimulation = {
    ...order,
    status: nextStatus,
    stockRestored: nextStatus === "Cancelled" ? true : order.stockRestored,
  };

  return { success: true, order: updatedOrder };
}

describe("Order Lifecycle State Machine & Terminal Locks", () => {
  it("allows standard forward progression from Pending to Delivered", () => {
    const order: OrderSimulation = { id: "ord-1", status: "Pending", stockRestored: false };

    const step1 = transitionOrderStatus(order, "Confirmed");
    expect(step1.success).toBe(true);
    expect(step1.order.status).toBe("Confirmed");

    const step2 = transitionOrderStatus(step1.order, "Shipped");
    expect(step2.success).toBe(true);
    expect(step2.order.status).toBe("Shipped");

    const step3 = transitionOrderStatus(step2.order, "Delivered");
    expect(step3.success).toBe(true);
    expect(step3.order.status).toBe("Delivered");
  });

  it("permits order cancellation from Pending status and flags inventory restoration", () => {
    const order: OrderSimulation = { id: "ord-2", status: "Pending", stockRestored: false };
    const res = transitionOrderStatus(order, "Cancelled");
    expect(res.success).toBe(true);
    expect(res.order.status).toBe("Cancelled");
    expect(res.order.stockRestored).toBe(true);
  });

  it("permits order cancellation from Confirmed status", () => {
    const order: OrderSimulation = { id: "ord-3", status: "Confirmed", stockRestored: false };
    const res = transitionOrderStatus(order, "Cancelled");
    expect(res.success).toBe(true);
    expect(res.order.status).toBe("Cancelled");
    expect(res.order.stockRestored).toBe(true);
  });

  it("strictly locks terminal Cancelled state from reverting back to Pending", () => {
    const order: OrderSimulation = { id: "ord-4", status: "Cancelled", stockRestored: true };
    const res = transitionOrderStatus(order, "Pending");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Terminal status lock");
    expect(res.order.status).toBe("Cancelled");
  });

  it("strictly locks terminal Delivered state from transitioning to Cancelled", () => {
    const order: OrderSimulation = { id: "ord-5", status: "Delivered", stockRestored: false };
    const res = transitionOrderStatus(order, "Cancelled");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Terminal status lock");
    expect(res.order.status).toBe("Delivered");
  });

  it("rejects illegal step-skipping transitions such as Pending directly to Delivered", () => {
    const order: OrderSimulation = { id: "ord-6", status: "Pending", stockRestored: false };
    const res = transitionOrderStatus(order, "Delivered");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid transition");
    expect(res.order.status).toBe("Pending");
  });
});
