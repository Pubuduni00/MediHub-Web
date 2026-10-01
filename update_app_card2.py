with open('d:\\Mobile-Medi\\lib\\widgets\\appointment_card.dart', 'r', encoding='utf-8') as f:
    content = f.read()

s = "            // Approved\n            if (isApproved) ...["
r = """            // ?? Investigations ??
            if (appointment.hasInvestigations) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3E0),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: AppColors.warning.withOpacity(0.4),
                      width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.assignment_outlined,
                            color: AppColors.warning, size: 18),
                        SizedBox(width: 8),
                        Text(
                          '?? Reports to Bring',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.warning,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...appointment.investigations.map((inv) => Padding(
                          padding: const EdgeInsets.only(left: 26, bottom: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(top: 4, right: 8),
                                child: Icon(Icons.circle,
                                    size: 4, color: AppColors.warning),
                              ),
                              Expanded(
                                child: Text(
                                  inv,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    color: AppColors.textPrimary,
                                    height: 1.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),
                    if (appointment.investigationNotes != null &&
                        appointment.investigationNotes!.trim().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Padding(
                        padding: const EdgeInsets.only(left: 26),
                        child: Text(
                          'Note: ${appointment.investigationNotes}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],

            // Approved
            if (isApproved) ...["""

if s in content:
    content = content.replace(s, r)
    with open('d:\\Mobile-Medi\\lib\\widgets\\appointment_card.dart', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found!")
