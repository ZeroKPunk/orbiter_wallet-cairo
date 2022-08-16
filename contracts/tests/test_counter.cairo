# SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin

#
# Storage
#

@storage_var
func _count() -> (count : felt):
end

#
# Getters
#

@view
func get_count{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    count : felt
):
    let (count) = _count.read()
    return (count=count)
end

#
# Setters
#

@external
func increase{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(value : felt):
    let (count) = _count.read()
    _count.write(count + value)
    return ()
end
