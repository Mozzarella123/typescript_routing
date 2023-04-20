import React from 'react';
import { Modal, Table } from "@gravity-ui/uikit";
import { useParams } from "react-router-dom";

type Task = {
  id: number
  name: string
  description: string
  status: string
  dueDate: string
}

const createTask = (task: Partial<Task>) => ({
  id: 0,
  name: "",
  description: "",
  status: "",
  dueDate: "",
  ...task,
})

// tasks with id, name, description, status, and due date
const data = [
  createTask({ id: 1, name: "Task 1", description: "Task 1 description", status: "In Progress", dueDate: "2021-01-01" }),
  createTask({ id: 2, name: "Task 2", description: "Task 2 description", status: "In Progress", dueDate: "2021-01-01" }),
  createTask({ id: 3, name: "Task 3", description: "Task 3 description", status: "In Progress", dueDate: "2021-01-01" }),
  createTask({ id: 4, name: "Task 4", description: "Task 4 description", status: "In Progress", dueDate: "2021-01-01" }),
]
function Tasks() {
    const { taskId } = useParams();
    return (
        <>
          <Table data={data} columns={[{
            id: 'name',
            name: 'id',
          }, {
            id: 'description',
            name: 'description',
          }, {
            id: 'status',
            name: 'status',
          }, {
            id: 'dueDate',
            name: 'dueDate',
          }]}/>
          <Modal open={taskId !== undefined}>
            <div className="flex flex-col gap-2">
              <h1>Task Details</h1>
              <span>Details</span>
            </div>
          </Modal>
        </>
    )
}

export default Tasks;
