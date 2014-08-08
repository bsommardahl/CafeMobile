define(["config", "localStore"], function(config, local) {

	return {
		"Location" : {
			Get : function() {
				return local.First("/locations", function(l) {
					return l._id == config.LocationId;
				});
			}
		},
		Product : {
			SaveNameChange : function(itemId, name) {
				return local.Update("/products", function(prod) {
					return prod._id == itemId
				}, function(prod) {
					prod.Name = name;
					return prod;
				});
			},
			SavePriceChange : function(itemId, price) {
				return local.Update("/products", function(prod) {
					return prod._id == itemId
				}, function(prod) {
					prod.Price = price;
					return prod;
				});
			},
			SaveTaxRateChange : function(itemId, taxRate) {
				return local.Update("/products", function(prod) {
					return prod._id == itemId
				}, function(prod) {
					prod.TaxRate = taxRate;
					return prod;
				});
			},
			SaveTagChange : function(itemId, tag) {
				return local.Update("/products", function(prod) {
					return prod._id == itemId
				}, function(prod) {
					prod.Tag = tag;
					return prod;
				});
			},
			SavePriorityChange : function(itemId, priority) {
				return local.Update("/products", function(prod) {
					return prod._id == itemId
				}, function(prod) {
					prod.Priority = priority;
					return prod;
				});
			},
			Create : function(item) {
				return local.Add("/products", item);
			},
			Delete : function(itemId) {
				return local.Remove("/products", function(d) {
					return d._id == itemId;
				});
			}
		},
		Debits : {
			GetById : function(debitId) {
				return local.First("/debits", function(d) {
					return d._id == debitId;
				});
			},
			GetAllForDate : function(startDate, endDate) {
				return local.Query("/debits", function(d) {
					var s = moment(startDate).startOf('day');
					var e = moment(endDate).endOf('day');
					var c = moment(d.CreatedDate);
					return c >= s && c < e;
				});
			},
			Create : function(debit) {
				return local.Add("/debits", debit);
			},
			Delete : function(debitId) {
				return local.Remove("/debits", function(d) {
					return d._id == debitId;
				});
			},
			Update: function(debitId, changes) {
				return local.Update("/debits", function(o) {
					return o._id == debitId
				}, function(o) {
					o = _.extend({}, o, changes);					
					return o;
				});
			},
		},
		Vendors : {
			GetAll : function() {
				return local.Query("/vendors");
			}
		},
		Employees : {
			GetAll : function() {
				return local.Query("/employees");
			},
			GetById : function(employeeId) {
				return local.First("/employees", function(emp) {
					return emp._id == employeeId;
				});
			},
			CreateNew : function(employeeName) {
				return local.Add("/employees", {
					Name : employeeName
				});
			},
			Delete : function(employeeId) {
				var skipRemoteDelete = true;
				return local.Remove("/times", function(t) {
					return t.EmployeeId == employeeId
				}, skipRemoteDelete).done(function() {
					return local.Remove("/employees", function(emp) {
						//this will trigger a remote delete for employees, which will delete child times as well
						return emp._id == employeeId
					})
				});
			},
		},
		Hooks : {
			Create : function(hook) {
				return local.Add("/hooks", hook);
			},
			Delete : function(hookId) {
				return local.Remove("/hooks", function(t) {
					return t._id == hookId;
				});
			},
			GetAll : function() {
				return local.Query("/hooks");
			}
		},
		Times : {
			CreateNew : function(timeEntry) {
				timeEntry.CreatedDate = new Date();
				timeEntry.Date = moment(timeEntry.Date)._d;
				return local.Add("/times", timeEntry);
			},
			GetByEmployeeId : function(employeeId) {
				return local.Query("/times", function(t) {
					return t.EmployeeId == employeeId
				});
			},
			Delete : function(timeEntryId) {
				return local.Remove("/times", function(t) {
					return t._id == timeEntryId
				});
			},
			GetByDate : function(startDate, endDate) {
				return local.Query("/times", function(t) {
					var s = moment(startDate).startOf('day');
					var e = moment(endDate).endOf('day');
					var d = moment(t.Date);
					return d >= s && d < e;
				});
			},
		},
		Orders : {
			Delete : function(orderId) {
				return local.Remove("/orders", function(o) {
					return o._id == orderId
				});
			},
			ChangePaidDate : function(orderId, newPaidDate) {
				return local.Update("/orders", function(o) {
					return o._id == orderId
				}, function(o) {
					console.log("changing paid date for " + o._id);
					o.Paid = newPaidDate
					return o;
				});
			},
		},
		GetTags : function() {
			return local.Query("/tags");
		},
		GetItemsByTag : function(tagName) {
			return local.Query("/products", function(product) {
				return product.Tag == tagName;
			});
		},
		GetItems : function() {
			return local.Query("/products");
		},
		CreateOrder : function(order) {
			if (order._id) {
				alert("Cannot create an order that has already been created.");
				return false;
			}
			order.Created = new Date();
			return local.Add("/orders", order);
		},
		UpdateOrder : function(order) {
			if (order._id) {
				return local.Update("/orders", function(o) {
					return o._id == order._id
				}, function(o) {
					o.Items = order.Items;
					o.CustomerName = order.CustomerName;
					o.AllDelivered = order.AllDelivered;
					o.Paid = order.Paid;
					o.AmountPaid = order.AmountPaid;
					o.TaxPaid = order.TaxPaid;
					return o;
				});
			}
			alert("Cannot update an order that has not been created yet.");
			return $.Deferred();
		},
		GetOpenOrders : function() {
			return local.Query("/orders", function(order) {
				return (!order.Paid || order.Paid == null) || !order.AllDelivered;
			});
		},
		GetPaidOrders : function(start, end) {
			return local.Query("/orders", function(order) {
				if (!order.Paid) {
					return false;
				}
				
				var paid = moment(order.Paid);

				var s = moment(start).startOf('day');
				var afterStartDate = paid.isAfter(s);
				if (!afterStartDate) {
					return false;
				}

				var e = moment(end).endOf('day');
				var beforeEndDate = paid.isBefore(e);
				if (!beforeEndDate) {
					return false;
				}

				return true;
			});
		},
		GetOrderById : function(orderId) {
			return local.First("/orders", function(order) {
				return order._id == orderId;
			});
		},
		GetItemById : function(itemId) {
			return local.First("/products", function(product) {
				return product._id == itemId;
			});
		}
	};
});
